import { forwardRef } from 'react';
import { Sale, Customer } from '@/hooks/useCustomersDB';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ReceiptProps {
  sale: Sale;
  customer: Customer;
  marketName?: string;
}

export const Receipt = forwardRef<HTMLDivElement, ReceiptProps>(
  ({ sale, customer, marketName = "MERCADO GONÇALVES" }, ref) => {
    return (
      <div 
        ref={ref}
        className="bg-white p-8 w-[320px] font-mono text-sm print:block shadow-lg"
        style={{ fontFamily: 'Courier New, monospace' }}
      >
        {/* Header */}
        <div className="text-center border-b-2 border-double border-gray-800 pb-4 mb-4">
          <div className="text-2xl font-black tracking-wider mb-1">🛒</div>
          <h1 className="text-xl font-black tracking-wide">{marketName}</h1>
          <p className="text-[10px] text-gray-500 mt-1">CNPJ: 00.000.000/0000-00</p>
          <div className="mt-2 py-1 bg-gray-100 rounded">
            <p className="text-xs font-bold text-gray-700">COMPROVANTE DE COMPRA FIADO</p>
          </div>
        </div>

        {/* Sale Info */}
        <div className="bg-gray-50 rounded p-3 mb-4 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-gray-600 text-xs">📅 Data:</span>
            <span className="font-semibold text-xs">{format(new Date(sale.date), "dd/MM/yyyy HH:mm", { locale: ptBR })}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600 text-xs">⏰ Vencimento:</span>
            <span className="font-bold text-red-600 text-xs bg-red-50 px-2 py-0.5 rounded">
              {format(new Date(sale.dueDate), "dd/MM/yyyy", { locale: ptBR })}
            </span>
          </div>
          <div className="flex justify-between items-center border-t border-gray-200 pt-2">
            <span className="text-gray-600 text-xs">👤 Cliente:</span>
            <span className="font-semibold text-xs text-right max-w-[150px] truncate">{customer.name}</span>
          </div>
        </div>

        {/* Products */}
        <div className="border border-gray-300 rounded overflow-hidden mb-4">
          <div className="bg-gray-800 text-white py-2 px-3">
            <span className="font-bold text-xs">📦 PRODUTOS</span>
          </div>
          <div className="p-3 space-y-2">
            {sale.items.map((item, index) => (
              <div key={index} className="flex justify-between text-xs border-b border-dashed border-gray-200 pb-1 last:border-0 last:pb-0">
                <span className="flex-1 truncate mr-2 text-gray-700">{index + 1}. {item.product}</span>
                <span className="font-medium">R$ {item.value.toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="bg-green-600 text-white py-3 px-3">
            <div className="flex justify-between text-base font-black">
              <span>TOTAL:</span>
              <span>R$ {sale.totalValue.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Debt Summary */}
        <div className="bg-amber-50 border border-amber-200 rounded p-3 mb-4 space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-gray-600">Dívida Anterior:</span>
            <span>R$ {(customer.currentDebt - sale.totalValue).toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-sm border-t border-amber-200 pt-2">
            <span>💰 Dívida Total:</span>
            <span className="text-amber-700">R$ {customer.currentDebt.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>Limite de Crédito:</span>
            <span>R$ {customer.creditLimit.toFixed(2)}</span>
          </div>
        </div>

        {/* Signature */}
        <div className="border-2 border-gray-800 rounded p-4 mb-4">
          <p className="text-center text-xs font-bold text-gray-600 mb-6">✍️ ASSINATURA DO CLIENTE</p>
          <div className="border-b-2 border-gray-800 mx-2 h-10"></div>
          <p className="text-center text-xs mt-2 font-semibold">{customer.name}</p>
        </div>

        {/* Footer */}
        <div className="text-center space-y-1 pt-2">
          <p className="text-xs font-semibold text-gray-700">⭐ Obrigado pela preferência!</p>
          <p className="text-[10px] text-gray-500">Este documento é um comprovante de dívida</p>
          <div className="mt-3 py-2 bg-red-50 rounded border border-red-200">
            <p className="text-xs font-bold text-red-600">
              ⚠️ VENCIMENTO: {format(new Date(sale.dueDate), "dd/MM/yyyy", { locale: ptBR })}
            </p>
          </div>
          <p className="text-[9px] text-gray-400 mt-3">
            {format(new Date(), "dd/MM/yyyy HH:mm:ss", { locale: ptBR })}
          </p>
        </div>
      </div>
    );
  }
);

Receipt.displayName = 'Receipt';
