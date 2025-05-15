
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { cn } from '@/lib/utils';
import { Upload, File } from 'lucide-react';
import { StatusIndicator } from './StatusIndicator';
import { useToast } from '@/hooks/use-toast';

interface FileUploaderProps {
  onFileAccepted: (file: File) => void;
  acceptedFileTypes?: string[];
  maxSize?: number;
  className?: string;
}

export const FileUploader = ({
  onFileAccepted,
  acceptedFileTypes = ['.pdf'],
  maxSize = 5242880, // 5MB
  className
}: FileUploaderProps) => {
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setSelectedFile(file);
      setUploadStatus('loading');
      
      // Simulate upload delay
      setTimeout(() => {
        setUploadStatus('success');
        onFileAccepted(file);
        toast({
          title: "File caricato con successo",
          description: `${file.name} è stato caricato.`,
        });
      }, 1500);
    }
  }, [onFileAccepted, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFileTypes.reduce((acc, type) => {
      acc[type] = [];
      return acc;
    }, {} as Record<string, string[]>),
    maxSize,
    multiple: false,
    onDropRejected: () => {
      setUploadStatus('error');
      toast({
        title: "Errore di caricamento",
        description: "Il file non è valido o supera le dimensioni consentite.",
        variant: "destructive"
      });
    }
  });

  return (
    <div className={cn("space-y-4", className)}>
      <div 
        {...getRootProps()} 
        className={cn(
          "border-2 border-dashed rounded-lg p-8 transition-colors cursor-pointer",
          "flex flex-col items-center justify-center text-center",
          isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        )}
      >
        <input {...getInputProps()} />
        <div className={cn(
          "w-16 h-16 rounded-full flex items-center justify-center mb-4",
          isDragActive ? "bg-primary/10" : "bg-muted"
        )}>
          <Upload className={cn(
            "h-8 w-8",
            isDragActive ? "text-primary" : "text-muted-foreground"
          )} />
        </div>
        <div>
          <p className="text-lg font-medium mb-1">
            {isDragActive ? "Rilascia qui il file" : "Trascina qui il file o clicca per selezionarlo"}
          </p>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Supportiamo solo file PDF delle bollette energetiche. Dimensione massima: 5MB.
          </p>
        </div>
      </div>

      {selectedFile && (
        <div className="flex items-center justify-between bg-muted p-3 rounded-lg">
          <div className="flex items-center">
            <File className="h-5 w-5 mr-3 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">{selectedFile.name}</p>
              <p className="text-xs text-muted-foreground">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
          <StatusIndicator 
            status={uploadStatus} 
            text={uploadStatus === 'loading' ? 'Caricamento...' : undefined} 
          />
        </div>
      )}
    </div>
  );
};
