import { Customer } from '@/hooks/useCustomersDB';
import { Cake } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface BirthdayReminderProps {
  customers: Customer[];
}

export function BirthdayReminder({ customers }: BirthdayReminderProps) {
  const today = new Date();
  const todayMonth = today.getMonth();
  const todayDay = today.getDate();

  const birthdayCustomers = customers.filter(c => {
    if (!c.birthDate) return false;
    return c.birthDate.getMonth() === todayMonth && c.birthDate.getDate() === todayDay;
  });

  if (birthdayCustomers.length === 0) return null;

  return (
    <Alert className="border-primary/30 bg-primary/5 mb-6">
      <Cake className="h-5 w-5 text-primary" />
      <AlertTitle className="text-primary font-semibold">
        🎂 Aniversariante{birthdayCustomers.length > 1 ? 's' : ''} do dia!
      </AlertTitle>
      <AlertDescription>
        {birthdayCustomers.map((c, i) => (
          <span key={c.id}>
            <strong>{c.name}</strong>
            {i < birthdayCustomers.length - 1 ? ', ' : ''}
          </span>
        ))}
        {birthdayCustomers.length === 1 ? ' faz' : ' fazem'} aniversário hoje! 🎉
      </AlertDescription>
    </Alert>
  );
}