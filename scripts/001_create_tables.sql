-- Create streaming_services table
CREATE TABLE IF NOT EXISTS public.streaming_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create customers table
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create accounts table
CREATE TABLE IF NOT EXISTS public.accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES public.streaming_services(id) ON DELETE CASCADE,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  duration_days INTEGER NOT NULL,
  expiration_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
  credentials TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create notifications table to track sent notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('5_days', '3_days', '1_day', 'expired')),
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'failed')),
  error_message TEXT
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_accounts_customer_id ON public.accounts(customer_id);
CREATE INDEX IF NOT EXISTS idx_accounts_service_id ON public.accounts(service_id);
CREATE INDEX IF NOT EXISTS idx_accounts_expiration_date ON public.accounts(expiration_date);
CREATE INDEX IF NOT EXISTS idx_accounts_status ON public.accounts(status);
CREATE INDEX IF NOT EXISTS idx_notifications_account_id ON public.notifications(account_id);

-- Create function to automatically update expiration_date
CREATE OR REPLACE FUNCTION update_expiration_date()
RETURNS TRIGGER AS $$
BEGIN
  NEW.expiration_date := NEW.start_date + (NEW.duration_days || ' days')::INTERVAL;
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update expiration_date automatically
DROP TRIGGER IF EXISTS trigger_update_expiration_date ON public.accounts;
CREATE TRIGGER trigger_update_expiration_date
  BEFORE INSERT OR UPDATE OF start_date, duration_days
  ON public.accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_expiration_date();

-- Create function to automatically update account status
CREATE OR REPLACE FUNCTION update_account_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.expiration_date < CURRENT_DATE THEN
    NEW.status := 'expired';
  ELSIF NEW.status = 'expired' AND NEW.expiration_date >= CURRENT_DATE THEN
    NEW.status := 'active';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update account status automatically
DROP TRIGGER IF EXISTS trigger_update_account_status ON public.accounts;
CREATE TRIGGER trigger_update_account_status
  BEFORE INSERT OR UPDATE OF expiration_date
  ON public.accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_account_status();
