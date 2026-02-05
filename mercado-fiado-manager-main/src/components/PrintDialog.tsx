import { useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Receipt } from './Receipt';
import { Sale, Customer } from '@/hooks/useCustomersDB';
import { Printer } from 'lucide-react';

interface PrintDialogProps {
  sale: Sale | null;
  customer: Customer | null;
  open: boolean;
  onClose: () => void;
  onMarkSigned: (saleId: string) => void;
}

export function PrintDialog({ sale, customer, open, onClose, onMarkSigned }: PrintDialogProps) {
  const receiptRef = useRef<HTMLDivElement>(null);

  if (!sale || !customer) return null;

  const handlePrint = () => {
    const printContent = receiptRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '', 'width=350,height=600');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Comprovante</title>
            <style>
              body {
                font-family: 'Courier New', monospace;
                margin: 0;
                padding: 20px;
              }
              * {
                box-sizing: border-box;
              }
            </style>
          </head>
          <body>
            ${printContent.innerHTML}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }

    onMarkSigned(sale.id);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-fit">
        <DialogHeader>
          <DialogTitle>Comprovante de Venda</DialogTitle>
        </DialogHeader>
        
        <div className="flex justify-center bg-muted p-4 rounded-lg">
          <Receipt ref={receiptRef} sale={sale} customer={customer} />
        </div>

        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handlePrint} className="gap-2">
            <Printer className="h-4 w-4" />
            Imprimir
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
