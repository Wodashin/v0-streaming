-- Add user capacity to streaming_services table
ALTER TABLE public.streaming_services 
ADD COLUMN IF NOT EXISTS default_user_capacity INTEGER DEFAULT 1;

-- Add user capacity to accounts table
ALTER TABLE public.accounts 
ADD COLUMN IF NOT EXISTS user_capacity INTEGER DEFAULT 1;

-- Create account_users table to store multiple users per account
CREATE TABLE IF NOT EXISTS public.account_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  user_email TEXT,
  user_phone TEXT,
  profile_name TEXT,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_account_users_account_id ON public.account_users(account_id);
CREATE INDEX IF NOT EXISTS idx_account_users_user_name ON public.account_users(user_name);
CREATE INDEX IF NOT EXISTS idx_account_users_user_email ON public.account_users(user_email);
CREATE INDEX IF NOT EXISTS idx_account_users_user_phone ON public.account_users(user_phone);

-- Update existing streaming services with default capacities
UPDATE public.streaming_services 
SET default_user_capacity = CASE 
  WHEN name ILIKE '%netflix%premium%' OR name ILIKE '%netflix%4%' THEN 4
  WHEN name ILIKE '%netflix%standard%' OR name ILIKE '%netflix%2%' THEN 2
  WHEN name ILIKE '%netflix%' THEN 1
  WHEN name ILIKE '%disney%' THEN 4
  WHEN name ILIKE '%hbo%' OR name ILIKE '%max%' THEN 3
  WHEN name ILIKE '%prime%' THEN 3
  WHEN name ILIKE '%spotify%family%' THEN 6
  WHEN name ILIKE '%spotify%duo%' THEN 2
  WHEN name ILIKE '%spotify%' THEN 1
  WHEN name ILIKE '%youtube%family%' THEN 6
  WHEN name ILIKE '%youtube%' THEN 1
  WHEN name ILIKE '%chatgpt%team%' THEN 10
  WHEN name ILIKE '%chatgpt%plus%' THEN 1
  ELSE 1
END;

-- Update existing accounts to inherit capacity from their service
UPDATE public.accounts a
SET user_capacity = (
  SELECT default_user_capacity 
  FROM public.streaming_services s 
  WHERE s.id = a.service_id
);

-- Create function to automatically set user_capacity from service
CREATE OR REPLACE FUNCTION set_account_user_capacity()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.user_capacity IS NULL OR NEW.user_capacity = 0 THEN
    SELECT default_user_capacity INTO NEW.user_capacity
    FROM public.streaming_services
    WHERE id = NEW.service_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to set user_capacity automatically
DROP TRIGGER IF EXISTS trigger_set_account_user_capacity ON public.accounts;
CREATE TRIGGER trigger_set_account_user_capacity
  BEFORE INSERT OR UPDATE OF service_id
  ON public.accounts
  FOR EACH ROW
  EXECUTE FUNCTION set_account_user_capacity();

-- Add comment to explain the tables
COMMENT ON TABLE public.account_users IS 'Stores multiple users/profiles for each streaming account';
COMMENT ON COLUMN public.accounts.user_capacity IS 'Maximum number of users allowed for this account';
COMMENT ON COLUMN public.streaming_services.default_user_capacity IS 'Default number of users for new accounts of this service';
