import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { ShoppingCart, Plus, Trash2, Eye, Search, Check } from 'lucide-react';
import { Customer, Sale, SaleItem } from '@/hooks/useCustomersDB';
import { cn } from '@/lib/utils';

interface AddSaleDialogProps {
  customers: Customer[];
  onAdd: (sale: { customerId: string; items: SaleItem[]; totalValue: number }) => Promise<{ sale: Sale; customer: Customer; isOverLimit: boolean } | null>;
  onPrint: (sale: Sale, customer: Customer) => void;
}

export function AddSaleDialog({ customers, onAdd, onPrint }: AddSaleDialogProps) {
  const [open, setOpen] = useState(false);
  const [customerSelectOpen, setCustomerSelectOpen] = useState(false);
  const [customerId, setCustomerId] = useState('');
  const [items, setItems] = useState<SaleItem[]>([{ product: '', value: 0 }]);
  const [showPreview, setShowPreview] = useState(false);

  // Sort customers alphabetically
  const sortedCustomers = useMemo(() => 
    [...customers].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')),
    [customers]
  );
  const handleAddItem = () => {
    setItems([...items, { product: '', value: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleItemChange = (index: number, field: keyof SaleItem, value: string) => {
    const newItems = [...items];
    if (field === 'product') {
      newItems[index].product = value;
    } else {
      newItems[index].value = parseFloat(value) || 0;
    }
    setItems(newItems);
  };

  const validItems = items.filter(item => item.product.trim() && item.value > 0);
  const totalValue = items.reduce((sum, item) => sum + item.value, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customerId || validItems.length === 0) return;

    const result = await onAdd({
      customerId,
      items: validItems,
      totalValue,
    });

    if (result) {
      onPrint(result.sale, result.customer);
      setCustomerId('');
      setItems([{ product: '', value: 0 }]);
      setShowPreview(false);
      setOpen(false);
    }
  };

  const selectedCustomer = customers.find(c => c.id === customerId);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" className="gap-2">
          <ShoppingCart className="h-4 w-4" />
          Nova venda a prazo
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Registrar venda a prazo</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Cliente</Label>
            <Popover open={customerSelectOpen} onOpenChange={setCustomerSelectOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={customerSelectOpen}
                  className="w-full justify-start font-normal gap-2"
                >
                  <Search className="h-4 w-4 shrink-0 opacity-50" />
                  {selectedCustomer 
                    ? `${selectedCustomer.name} - Dívida: R$ ${selectedCustomer.currentDebt.toFixed(2)}`
                    : "Buscar cliente pelo nome..."}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                <Command>
                  <CommandInput placeholder="Buscar cliente pelo nome..." />
                  <CommandList>
                    <CommandEmpty>Nenhum cliente encontrado.</CommandEmpty>
                    <CommandGroup>
                      {sortedCustomers.map(customer => (
                        <CommandItem
                          key={customer.id}
                          value={customer.name}
                          onSelect={() => {
                            setCustomerId(customer.id);
                            setCustomerSelectOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              customerId === customer.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          <div className="flex flex-col">
                            <span>{customer.name}</span>
                            <span className="text-xs text-muted-foreground">
                              Dívida: R$ {customer.currentDebt.toFixed(2)}
                            </span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {selectedCustomer && (
              <p className="text-xs text-muted-foreground">
                Limite disponível: R$ {(selectedCustomer.creditLimit - selectedCustomer.currentDebt).toFixed(2)}
              </p>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label>Produtos</Label>
              <Button type="button" variant="outline" size="sm" onClick={handleAddItem}>
                <Plus className="h-4 w-4 mr-1" />
                Adicionar Produto
              </Button>
            </div>
            
            {items.map((item, index) => (
              <div key={index} className="flex gap-2 items-start">
                <div className="flex-1 space-y-1">
                  <Input
                    placeholder="Nome do produto"
                    value={item.product}
                    onChange={(e) => handleItemChange(index, 'product', e.target.value)}
                    required
                  />
                </div>
                <div className="w-28 space-y-1">
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Valor"
                    value={item.value || ''}
                    onChange={(e) => handleItemChange(index, 'value', e.target.value)}
                    required
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveItem(index)}
                  disabled={items.length === 1}
                  className="shrink-0"
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>

          {/* Preview dos produtos selecionados */}
          {validItems.length > 0 && (
            <div className="space-y-2">
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={() => setShowPreview(!showPreview)}
                className="w-full gap-2"
              >
                <Eye className="h-4 w-4" />
                {showPreview ? 'Ocultar' : 'Ver'} Resumo da Compra ({validItems.length} {validItems.length === 1 ? 'produto' : 'produtos'})
              </Button>
              
              {showPreview && (
                <div className="bg-secondary/50 rounded-lg p-4 space-y-2 border border-border">
                  <h4 className="font-semibold text-sm mb-3">Produtos Selecionados:</h4>
                  <div className="space-y-2">
                    {validItems.map((item, index) => (
                      <div key={index} className="flex justify-between items-center py-1 border-b border-border last:border-0">
                        <span className="text-sm">{item.product}</span>
                        <span className="text-sm font-medium">R$ {item.value.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center pt-2 mt-2 border-t-2 border-primary">
                    <span className="font-bold">Total:</span>
                    <span className="text-lg font-bold text-primary">R$ {totalValue.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="bg-muted rounded-lg p-3 flex justify-between items-center">
            <span className="font-medium">Total:</span>
            <span className="text-xl font-bold">R$ {totalValue.toFixed(2)}</span>
          </div>

          <Button type="submit" className="w-full" disabled={!customerId || totalValue === 0}>
            Registrar e Imprimir Comprovante
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
