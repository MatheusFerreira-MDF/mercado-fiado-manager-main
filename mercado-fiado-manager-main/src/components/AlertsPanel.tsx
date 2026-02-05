import { Customer } from '@/hooks/useCustomersDB';
import { AlertTriangle, TrendingUp } from 'lucide-react';

interface AlertsPanelProps {
  customers: Customer[];
}

export function AlertsPanel({ customers }: AlertsPanelProps) {
  const overLimitCustomers = customers.filter(c => c.currentDebt > c.creditLimit);
  const nearLimitCustomers = customers.filter(c => {
    const usage = (c.currentDebt / c.creditLimit) * 100;
    return usage >= 80 && usage <= 100;
  });

  if (overLimitCustomers.length === 0 && nearLimitCustomers.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {overLimitCustomers.length > 0 && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <h3 className="font-semibold text-destructive flex items-center gap-2 mb-3">
            <AlertTriangle className="h-5 w-5" />
            Clientes com Limite Excedido ({overLimitCustomers.length})
          </h3>
          <div className="space-y-2">
            {overLimitCustomers.map(customer => (
              <div key={customer.id} className="flex justify-between items-center bg-background/50 rounded p-2">
                <span className="font-medium">{customer.name}</span>
                <span className="text-destructive font-bold">
                  R$ {customer.currentDebt.toFixed(2)} / R$ {customer.creditLimit.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {nearLimitCustomers.length > 0 && (
        <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
          <h3 className="font-semibold text-warning flex items-center gap-2 mb-3">
            <TrendingUp className="h-5 w-5" />
            Clientes Próximos do Limite ({nearLimitCustomers.length})
          </h3>
          <div className="space-y-2">
            {nearLimitCustomers.map(customer => {
              const usage = (customer.currentDebt / customer.creditLimit) * 100;
              return (
                <div key={customer.id} className="flex justify-between items-center bg-background/50 rounded p-2">
                  <span className="font-medium">{customer.name}</span>
                  <span className="text-warning font-bold">
                    {usage.toFixed(0)}% utilizado
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
