import { useState, useCallback } from 'react';
import { Customer, Sale, PaymentMethod } from '@/types/customer';
import { toast } from '@/hooks/use-toast';
import { addDays } from 'date-fns';

const STORAGE_KEY_CUSTOMERS = 'mercado_customers';
const STORAGE_KEY_SALES = 'mercado_sales';

const loadFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error(`Error loading ${key}:`, error);
  }
  return defaultValue;
};

const saveToStorage = <T>(key: string, data: T) => {
  localStorage.setItem(key, JSON.stringify(data));
};

export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>(() => 
    loadFromStorage<Customer[]>(STORAGE_KEY_CUSTOMERS, [])
  );
  const [sales, setSales] = useState<Sale[]>(() =>
    loadFromStorage<Sale[]>(STORAGE_KEY_SALES, [])
  );

  const addCustomer = useCallback((customer: Omit<Customer, 'id' | 'currentDebt' | 'createdAt'>) => {
    const newCustomer: Customer = {
      ...customer,
      id: crypto.randomUUID(),
      currentDebt: 0,
      createdAt: new Date(),
    };
    setCustomers(prev => {
      const updated = [...prev, newCustomer];
      saveToStorage(STORAGE_KEY_CUSTOMERS, updated);
      return updated;
    });
    toast({
      title: "Cliente cadastrado!",
      description: `${customer.name} foi adicionado com sucesso.`,
    });
    return newCustomer;
  }, []);

  const addSale = useCallback((sale: Omit<Sale, 'id' | 'date' | 'signed' | 'dueDate' | 'paymentMethod'>) => {
    const customer = customers.find(c => c.id === sale.customerId);
    if (!customer) {
      toast({
        title: "Erro",
        description: "Cliente não encontrado.",
        variant: "destructive",
      });
      return null;
    }

    const newDebt = customer.currentDebt + sale.totalValue;
    const isOverLimit = newDebt > customer.creditLimit;

    const saleDate = new Date();
    const newSale: Sale = {
      ...sale,
      id: crypto.randomUUID(),
      date: saleDate,
      dueDate: addDays(saleDate, 30),
      paymentMethod: 'dinheiro', // Default, será atualizado no pagamento
      signed: false,
    };

    setSales(prev => {
      const updated = [...prev, newSale];
      saveToStorage(STORAGE_KEY_SALES, updated);
      return updated;
    });

    setCustomers(prev => {
      const updated = prev.map(c => 
        c.id === sale.customerId 
          ? { ...c, currentDebt: newDebt }
          : c
      );
      saveToStorage(STORAGE_KEY_CUSTOMERS, updated);
      return updated;
    });

    if (isOverLimit) {
      toast({
        title: "⚠️ LIMITE EXCEDIDO!",
        description: `${customer.name} ultrapassou o limite de R$ ${customer.creditLimit.toFixed(2)}. Dívida atual: R$ ${newDebt.toFixed(2)}`,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Venda registrada!",
        description: `Venda de R$ ${sale.totalValue.toFixed(2)} para ${customer.name}`,
      });
    }

    return { sale: newSale, customer: { ...customer, currentDebt: newDebt }, isOverLimit };
  }, [customers]);

  const markAsSigned = useCallback((saleId: string) => {
    setSales(prev => {
      const updated = prev.map(s => 
        s.id === saleId ? { ...s, signed: true } : s
      );
      saveToStorage(STORAGE_KEY_SALES, updated);
      return updated;
    });
  }, []);

  const payDebt = useCallback((customerId: string, amount: number, paymentMethod: PaymentMethod) => {
    setCustomers(prev => {
      const updated = prev.map(c => 
        c.id === customerId 
          ? { ...c, currentDebt: Math.max(0, c.currentDebt - amount) }
          : c
      );
      saveToStorage(STORAGE_KEY_CUSTOMERS, updated);
      return updated;
    });
    
    const methodLabels: Record<PaymentMethod, string> = {
      dinheiro: 'Dinheiro',
      pix: 'PIX',
      cartao: 'Cartão',
      cheque: 'Cheque',
    };
    
    toast({
      title: "Pagamento registrado!",
      description: `Pagamento de R$ ${amount.toFixed(2)} recebido via ${methodLabels[paymentMethod]}.`,
    });
  }, []);

  const getCustomerSales = useCallback((customerId: string) => {
    return sales.filter(s => s.customerId === customerId);
  }, [sales]);

  const getCustomersNearLimit = useCallback(() => {
    return customers.filter(c => c.currentDebt >= c.creditLimit * 0.8);
  }, [customers]);

  return {
    customers,
    sales,
    addCustomer,
    addSale,
    markAsSigned,
    payDebt,
    getCustomerSales,
    getCustomersNearLimit,
  };
}
