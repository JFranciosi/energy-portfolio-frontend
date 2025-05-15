
import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { ChevronDown, Info } from 'lucide-react';

interface NoteSectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  defaultOpen?: boolean;
}

export const NotesSection = ({
  title,
  children,
  className,
  defaultOpen = false
}: NoteSectionProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className={cn(
        "border rounded-lg bg-muted/30 overflow-hidden",
        className
      )}
    >
      <div className="flex items-center px-4 py-3">
        <Info className="h-4 w-4 text-muted-foreground mr-2" />
        <h4 className="text-sm font-medium flex-1">{title}</h4>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="p-1 h-auto">
            <ChevronDown
              className={cn(
                "h-4 w-4 text-muted-foreground transition-transform",
                isOpen && "transform rotate-180"
              )}
            />
            <span className="sr-only">Toggle</span>
          </Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent>
        <div className="px-4 pb-4 pt-0 text-sm text-muted-foreground">
          {children}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};
