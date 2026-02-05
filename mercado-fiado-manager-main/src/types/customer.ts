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
  paymentMethod: PaymentMethod;
  date: Date;
  dueDate: Date;
  signed: boolean;
}

export interface SaleWithCustomer extends Sale {
  customerName: string;
}
