-- Add UPDATE policy for payments table to allow users to correct their own payment records
CREATE POLICY "Users can update their own payments" 
ON public.payments 
FOR UPDATE 
USING (auth.uid() = user_id);