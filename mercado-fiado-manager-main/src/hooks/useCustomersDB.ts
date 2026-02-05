import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { addDays } from 'date-fns';

export interface Customer {
  id: string;
  name: string;
  phone: string;
  creditLimit: number;
  currentDebt: number;
  createdAt: Date;
}

export interface SaleItem {
  product: string;
  value: number;
}

export type PaymentMethod = 'dinheiro' | 'pix' | 'cartao' | 'cheque';

export interface Sale {
  id: string;
  customerId: string;
  items: SaleItem[];
  totalValue: number;
  date: Date;
  dueDate: Date;
  signed: boolean;
}

export function useCustomersDB(userId: string | undefined) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch customers
  const fetchCustomers = useCallback(async () => {
    if (!userId) return;

    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('name');

    if (error) {
      if (import.meta.env.DEV) {
        console.error('Error fetching customers:', error);
      }
      return;
    }

    setCustomers(data.map(c => ({
      id: c.id,
      name: c.name,
      phone: c.phone,
      creditLimit: Number(c.credit_limit),
      currentDebt: Number(c.current_debt),
      createdAt: new Date(c.created_at),
    })));
  }, [userId]);

  // Fetch sales with items
  const fetchSales = useCallback(async () => {
    if (!userId) return;

    const { data: salesData, error: salesError } = await supabase
      .from('sales')
      .select('*, sale_items(*)')
      .order('created_at', { ascending: false });

    if (salesError) {
      if (import.meta.env.DEV) {
        console.error('Error fetching sales:', salesError);
      }
      return;
    }

    setSales(salesData.map(s => ({
      id: s.id,
      customerId: s.customer_id,
      items: s.sale_items.map((item: { product: string; value: number }) => ({
        product: item.product,
        value: Number(item.value),
      })),
      totalValue: Number(s.total_value),
      date: new Date(s.created_at),
      dueDate: new Date(s.due_date),
      signed: s.signed,
    })));
  }, [userId]);

  useEffect(() => {
    if (userId) {
      setLoading(true);
      Promise.all([fetchCustomers(), fetchSales()]).finally(() => {
        setLoading(false);
      });
    }
  }, [userId, fetchCustomers, fetchSales]);

  const addCustomer = useCallback(async (customer: Omit<Customer, 'id' | 'currentDebt' | 'createdAt'>) => {
    if (!userId) return null;

    const { data, error } = await supabase
      .from('customers')
      .insert({
        user_id: userId,
        name: customer.name,
        phone: customer.phone,
        credit_limit: customer.creditLimit,
        current_debt: 0,
      })
      .select()
      .single();

    if (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível cadastrar o cliente.',
        variant: 'destructive',
      });
      return null;
    }

    const newCustomer: Customer = {
      id: data.id,
      name: data.name,
      phone: data.phone,
      creditLimit: Number(data.credit_limit),
      currentDebt: Number(data.current_debt),
      createdAt: new Date(data.created_at),
    };

    setCustomers(prev => [...prev, newCustomer]);

    toast({
      title: 'Cliente cadastrado!',
      description: `${customer.name} foi adicionado com sucesso.`,
    });

    return newCustomer;
  }, [userId]);

  const addSale = useCallback(async (sale: { customerId: string; items: SaleItem[]; totalValue: number }) => {
    if (!userId) return null;

    const customer = customers.find(c => c.id === sale.customerId);
    if (!customer) {
      toast({
        title: 'Erro',
        description: 'Cliente não encontrado.',
        variant: 'destructive',
      });
      return null;
    }

    const newDebt = customer.currentDebt + sale.totalValue;
    const isOverLimit = newDebt > customer.creditLimit;
    const dueDate = addDays(new Date(), 30);

    // Create sale
    const { data: saleData, error: saleError } = await supabase
      .from('sales')
      .insert({
        user_id: userId,
        customer_id: sale.customerId,
        total_value: sale.totalValue,
        due_date: dueDate.toISOString().split('T')[0],
        signed: false,
      })
      .select()
      .single();

    if (saleError) {
      toast({
        title: 'Erro',
        description: 'Não foi possível registrar a venda.',
        variant: 'destructive',
      });
      return null;
    }

    // Create sale items
    const { error: itemsError } = await supabase
      .from('sale_items')
      .insert(
        sale.items.map(item => ({
          sale_id: saleData.id,
          product: item.product,
          value: item.value,
        }))
      );

    if (itemsError && import.meta.env.DEV) {
      console.error('Error creating sale items:', itemsError);
    }

    // Update customer debt
    const { error: updateError } = await supabase
      .from('customers')
      .update({ current_debt: newDebt })
      .eq('id', sale.customerId);

    if (updateError && import.meta.env.DEV) {
      console.error('Error updating customer debt:', updateError);
    }

    const newSale: Sale = {
      id: saleData.id,
      customerId: sale.customerId,
      items: sale.items,
      totalValue: sale.totalValue,
      date: new Date(saleData.created_at),
      dueDate: new Date(saleData.due_date),
      signed: false,
    };

    setSales(prev => [newSale, ...prev]);
    setCustomers(prev => prev.map(c =>
      c.id === sale.customerId ? { ...c, currentDebt: newDebt } : c
    ));

    if (isOverLimit) {
      toast({
        title: '⚠️ LIMITE EXCEDIDO!',
        description: `${customer.name} ultrapassou o limite de R$ ${customer.creditLimit.toFixed(2)}. Dívida atual: R$ ${newDebt.toFixed(2)}`,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Venda registrada!',
        description: `Venda de R$ ${sale.totalValue.toFixed(2)} para ${customer.name}`,
      });
    }

    return { sale: newSale, customer: { ...customer, currentDebt: newDebt }, isOverLimit };
  }, [userId, customers]);

  const markAsSigned = useCallback(async (saleId: string) => {
    const { error } = await supabase
      .from('sales')
      .update({ signed: true })
      .eq('id', saleId);

    if (error) {
      if (import.meta.env.DEV) {
        console.error('Error marking as signed:', error);
      }
      return;
    }

    setSales(prev => prev.map(s =>
      s.id === saleId ? { ...s, signed: true } : s
    ));
  }, []);

  const payDebt = useCallback(async (customerId: string, amount: number, paymentMethod: PaymentMethod) => {
    if (!userId) return;

    const customer = customers.find(c => c.id === customerId);
    if (!customer) return;

    const newDebt = Math.max(0, customer.currentDebt - amount);

    // Record payment
    const { error: paymentError } = await supabase
      .from('payments')
      .insert({
        user_id: userId,
        customer_id: customerId,
        amount: amount,
        payment_method: paymentMethod,
      });

    if (paymentError) {
      toast({
        title: 'Erro',
        description: 'Não foi possível registrar o pagamento.',
        variant: 'destructive',
      });
      return;
    }

    // Update customer debt
    const { error: updateError } = await supabase
      .from('customers')
      .update({ current_debt: newDebt })
      .eq('id', customerId);

    if (updateError) {
      if (import.meta.env.DEV) {
        console.error('Error updating customer debt:', updateError);
      }
      return;
    }

    setCustomers(prev => prev.map(c =>
      c.id === customerId ? { ...c, currentDebt: newDebt } : c
    ));

    const methodLabels: Record<PaymentMethod, string> = {
      dinheiro: 'Dinheiro',
      pix: 'PIX',
      cartao: 'Cartão',
      cheque: 'Cheque',
    };

    toast({
      title: 'Pagamento registrado!',
      description: `Pagamento de R$ ${amount.toFixed(2)} recebido via ${methodLabels[paymentMethod]}.`,
    });
  }, [userId, customers]);

  const getCustomerSales = useCallback((customerId: string) => {
    return sales.filter(s => s.customerId === customerId);
  }, [sales]);

  const getCustomersNearLimit = useCallback(() => {
    return customers.filter(c => c.currentDebt >= c.creditLimit * 0.8);
  }, [customers]);

  return {
    customers,
    sales,
    loading,
    addCustomer,
    addSale,
    markAsSigned,
    payDebt,
    getCustomerSales,
    getCustomersNearLimit,
    refetch: () => {
      fetchCustomers();
      fetchSales();
    },
  };
}
