import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useCustomersDB, Customer, Sale } from '@/hooks/useCustomersDB';
import { CustomerCard } from '@/components/CustomerCard';
import { AddCustomerDialog } from '@/components/AddCustomerDialog';
import { AddSaleDialog } from '@/components/AddSaleDialog';
import { CustomerDetails } from '@/components/CustomerDetails';
import { PrintDialog } from '@/components/PrintDialog';
import { AlertsPanel } from '@/components/AlertsPanel';
import { BirthdayReminder } from '@/components/BirthdayReminder';
import { StatsSection } from '@/components/StatsSection';
import { Store, Users, Search, LogOut } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const Index = () => {
  const { user, signOut } = useAuth();
  const { 
    customers, 
    sales, 
    loading,
    addCustomer, 
    addSale, 
    markAsSigned, 
    payDebt, 
    getCustomerSales 
  } = useCustomersDB(user?.id);
  
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [printSale, setPrintSale] = useState<Sale | null>(null);
  const [printCustomer, setPrintCustomer] = useState<Customer | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleCustomerClick = (customer: Customer) => {
    setSelectedCustomer(customer);
    setDetailsOpen(true);
  };

  const handlePrint = (sale: Sale, customer: Customer) => {
    setPrintSale(sale);
    setPrintCustomer(customer);
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Store className="h-8 w-8" />
              <div>
                <h1 className="text-2xl font-bold">MERCADO GONÇALVES</h1>
                <p className="text-primary-foreground/80 text-sm">Sistema de Controle de Fiado</p>
              </div>
            </div>
            <div className="flex gap-3 items-center">
              <AddSaleDialog 
                customers={customers} 
                onAdd={addSale} 
                onPrint={handlePrint}
              />
              <AddCustomerDialog onAdd={addCustomer} />
              <Button 
                variant="secondary" 
                size="icon" 
                onClick={signOut}
                title="Sair"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats */}
        <StatsSection customers={customers} sales={sales} />

        {/* Birthday Reminder */}
        <BirthdayReminder customers={customers} />

        {/* Alerts */}
        <AlertsPanel customers={customers} />

        {/* Customer List */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Clientes</h2>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {filteredCustomers.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-xl border">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {customers.length === 0 ? 'Nenhum cliente cadastrado' : 'Nenhum cliente encontrado'}
              </h3>
              <p className="text-muted-foreground">
                {customers.length === 0 
                  ? 'Cadastre seu primeiro cliente clicando em "Novo Cliente"'
                  : 'Tente buscar por outro nome ou telefone'
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCustomers.map(customer => (
                <CustomerCard
                  key={customer.id}
                  customer={customer}
                  onClick={() => handleCustomerClick(customer)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Dialogs */}
      <CustomerDetails
        customer={selectedCustomer}
        sales={selectedCustomer ? getCustomerSales(selectedCustomer.id) : []}
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        onPayDebt={payDebt}
      />

      <PrintDialog
        sale={printSale}
        customer={printCustomer}
        open={!!printSale}
        onClose={() => {
          setPrintSale(null);
          setPrintCustomer(null);
        }}
        onMarkSigned={markAsSigned}
      />
    </div>
  );
};

export default Index;
