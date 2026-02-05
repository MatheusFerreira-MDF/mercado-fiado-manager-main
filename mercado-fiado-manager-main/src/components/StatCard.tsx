import { ReactNode, useState } from 'react';
import { LucideIcon, ChevronDown, ChevronUp } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

interface StatCardProps {
  icon: LucideIcon;
  iconClassName?: string;
  title: string;
  value: string | number;
  children?: ReactNode;
}

export function StatCard({ icon: Icon, iconClassName, title, value, children }: StatCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const hasContent = !!children;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="bg-card rounded-xl shadow-sm border overflow-hidden">
        <CollapsibleTrigger 
          className={cn(
            "w-full p-5 text-left transition-colors",
            hasContent && "hover:bg-muted/50 cursor-pointer"
          )}
          disabled={!hasContent}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn("rounded-lg p-3", iconClassName)}>
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{title}</p>
                <p className="text-2xl font-bold">{value}</p>
              </div>
            </div>
            {hasContent && (
              <div className="text-muted-foreground">
                {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </div>
            )}
          </div>
        </CollapsibleTrigger>
        
        {hasContent && (
          <CollapsibleContent>
            <div className="px-5 pb-5 pt-2 border-t bg-muted/30">
              {children}
            </div>
          </CollapsibleContent>
        )}
      </div>
    </Collapsible>
  );
}
