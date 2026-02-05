import { Customer } from '@/hooks/useCustomersDB';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Phone, AlertTriangle, CheckCircle } from 'lucide-react';

interface CustomerCardProps {
  customer: Customer;
  onClick?: () => void;
}

export function CustomerCard({ customer, onClick }: CustomerCardProps) {
  const usagePercent = (customer.currentDebt / customer.creditLimit) * 100;
  const isOverLimit = customer.currentDebt > customer.creditLimit;
  const isNearLimit = usagePercent >= 80;

  return (
    <Card 
      className="cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1"
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">{customer.name}</CardTitle>
          {isOverLimit ? (
            <Badge variant="destructive" className="gap-1">
              <AlertTriangle className="h-3 w-3" />
              Limite Excedido
            </Badge>
          ) : isNearLimit ? (
            <Badge variant="secondary" className="bg-warning text-warning-foreground gap-1">
              <AlertTriangle className="h-3 w-3" />
              Próximo do Limite
            </Badge>
          ) : (
            <Badge variant="secondary" className="bg-success text-success-foreground gap-1">
              <CheckCircle className="h-3 w-3" />
              Regular
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Phone className="h-3 w-3" />
          {customer.phone}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Dívida Atual</span>
            <span className="font-semibold">
              R$ {customer.currentDebt.toFixed(2)}
            </span>
          </div>
          <Progress 
            value={Math.min(usagePercent, 100)} 
            className={isOverLimit ? '[&>div]:bg-destructive' : isNearLimit ? '[&>div]:bg-warning' : '[&>div]:bg-success'}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Limite: R$ {customer.creditLimit.toFixed(2)}</span>
            <span>{usagePercent.toFixed(0)}% usado</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
