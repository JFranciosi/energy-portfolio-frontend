
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PortfolioCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  className?: string;
  footerContent?: React.ReactNode;
  onClick?: () => void;
}

export const PortfolioCard = ({
  title,
  description,
  icon: Icon,
  className,
  footerContent,
  onClick
}: PortfolioCardProps) => {
  return (
    <Card 
      className={cn(
        "flex flex-col h-full cursor-pointer transition-all duration-300",
        "hover:shadow-lg hover:border-primary/50 hover:translate-y-[-4px]",
        className
      )}
      onClick={onClick}
    >
      <CardHeader>
        <div className="flex items-start space-x-4">
          <div className="bg-primary/10 rounded-xl p-3">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-xl">{title}</h3>
            <p className="text-muted-foreground text-sm mt-1">{description}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        {/* Content slot */}
      </CardContent>
      {footerContent && (
        <CardFooter className="pt-0 pb-4">
          {footerContent}
        </CardFooter>
      )}
    </Card>
  );
};

export const PortfolioCardAction = ({ children, ...props }: React.ComponentProps<typeof Button>) => {
  return (
    <Button 
      variant="ghost" 
      className="h-9 px-3 text-primary hover:text-primary-foreground hover:bg-primary"
      {...props}
    >
      {children}
    </Button>
  );
};
