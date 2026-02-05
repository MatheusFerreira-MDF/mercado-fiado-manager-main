import { Customer, Sale } from '@/hooks/useCustomersDB';
import { StatCard } from './StatCard';
import { Users, DollarSign, ShoppingCart, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface StatsSectionProps {
  customers: Customer[];
  sales: Sale[];
}

export function StatsSection({ customers, sales }: StatsSectionProps) {
  const totalDebt = customers.reduce((sum, c) => sum + c.currentDebt, 0);
  
  const todaySales = sales.filter(s => {
    const saleDate = new Date(s.date);
    const today = new Date();
    return saleDate.toDateString() === today.toDateString();
  });
  const todayTotal = todaySales.reduce((sum, s) => sum + s.totalValue, 0);

  // Customers sorted by debt
  const customersWithDebt = customers
    .filter(c => c.currentDebt > 0)
    .sort((a, b) => b.currentDebt - a.currentDebt);

  // Customers by status
  const overLimitCustomers = customers.filter(c => c.currentDebt > c.creditLimit);
  const nearLimitCustomers = customers.filter(c => {
    const usage = (c.currentDebt / c.creditLimit) * 100;
    return usage >= 80 && c.currentDebt <= c.creditLimit;
  });
  const regularCustomers = customers.filter(c => {
    const usage = (c.currentDebt / c.creditLimit) * 100;
    return usage < 80;
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* Total de Clientes */}
      <StatCard
        icon={Users}
        iconClassName="bg-primary/10 text-primary"
        title="Total de Clientes"
        value={customers.length}
      >
        <div className="space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-destructive"></span>
              Limite excedido
            </span>
            <Badge variant="destructive">{overLimitCustomers.length}</Badge>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-warning"></span>
              Próximo do limite
            </span>
            <Badge variant="secondary" className="bg-warning/20 text-warning-foreground">{nearLimitCustomers.length}</Badge>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-success"></span>
              Regular
            </span>
            <Badge variant="secondary" className="bg-success/20 text-success-foreground">{regularCustomers.length}</Badge>
          </div>
        </div>
      </StatCard>

      {/* Total em Fiado */}
      <StatCard
        icon={DollarSign}
        iconClassName="bg-warning/10 text-warning"
        title="Total em Fiado"
        value={`R$ ${totalDebt.toFixed(2)}`}
      >
        <ScrollArea className="h-[150px]">
          <div className="space-y-2">
            {customersWithDebt.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-2">
                Nenhum cliente com dívida
              </p>
            ) : (
              customersWithDebt.slice(0, 5).map(customer => {
                const isOverLimit = customer.currentDebt > customer.creditLimit;
                return (
                  <div key={customer.id} className="flex justify-between items-center text-sm">
                    <span className="truncate flex-1 mr-2">{customer.name}</span>
                    <span className={`font-medium ${isOverLimit ? 'text-destructive' : ''}`}>
                      R$ {customer.currentDebt.toFixed(2)}
                    </span>
                  </div>
                );
              })
            )}
            {customersWithDebt.length > 5 && (
              <p className="text-xs text-muted-foreground text-center pt-1">
                +{customersWithDebt.length - 5} outros clientes
              </p>
            )}
          </div>
        </ScrollArea>
      </StatCard>

      {/* Vendas Hoje */}
      <StatCard
        icon={ShoppingCart}
        iconClassName="bg-success/10 text-success"
        title="Vendas Hoje"
        value={todaySales.length}
      >
        <ScrollArea className="h-[150px]">
          <div className="space-y-2">
            {todaySales.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-2">
                Nenhuma venda hoje
              </p>
            ) : (
              todaySales.slice().reverse().map(sale => {
                const customer = customers.find(c => c.id === sale.customerId);
                return (
                  <div key={sale.id} className="flex justify-between items-center text-sm border-b border-border/50 pb-2 last:border-0">
                    <div className="flex-1 min-w-0 mr-2">
                      <p className="truncate font-medium">{customer?.name || 'Cliente'}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(sale.date), "HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                    <span className="font-medium text-success">
                      R$ {sale.totalValue.toFixed(2)}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </StatCard>

      {/* Total Hoje */}
      <StatCard
        icon={DollarSign}
        iconClassName="bg-primary/10 text-primary"
        title="Total Hoje"
        value={`R$ ${todayTotal.toFixed(2)}`}
      >
        <div className="space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span>Quantidade de vendas</span>
            <span className="font-medium">{todaySales.length}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span>Ticket médio</span>
            <span className="font-medium">
              R$ {todaySales.length > 0 ? (todayTotal / todaySales.length).toFixed(2) : '0.00'}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span>Maior venda</span>
            <span className="font-medium text-success">
              R$ {todaySales.length > 0 ? Math.max(...todaySales.map(s => s.totalValue)).toFixed(2) : '0.00'}
            </span>
          </div>
        </div>
      </StatCard>
    </div>
  );
}
