-- Add status and lifecycle fields to account_users table
ALTER TABLE public.account_users 
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending_deletion')),
ADD COLUMN IF NOT EXISTS deactivated_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS scheduled_deletion_at TIMESTAMPTZ;

-- Create index for status queries
CREATE INDEX IF NOT EXISTS idx_account_users_status ON public.account_users(status);
CREATE INDEX IF NOT EXISTS idx_account_users_scheduled_deletion ON public.account_users(scheduled_deletion_at);

-- Create function to deactivate users when account expires
CREATE OR REPLACE FUNCTION deactivate_users_on_account_expiration()
RETURNS TRIGGER AS $$
BEGIN
  -- If account just expired, deactivate all users and schedule deletion for 2 months later
  IF NEW.status = 'expired' AND OLD.status != 'expired' THEN
    UPDATE public.account_users
    SET 
      status = 'inactive',
      deactivated_at = NOW(),
      scheduled_deletion_at = NOW() + INTERVAL '2 months',
      updated_at = NOW()
    WHERE account_id = NEW.id AND status = 'active';
  END IF;
  
  -- If account is renewed (expired -> active), reactivate users
  IF NEW.status = 'active' AND OLD.status = 'expired' THEN
    UPDATE public.account_users
    SET 
      status = 'active',
      deactivated_at = NULL,
      scheduled_deletion_at = NULL,
      updated_at = NOW()
    WHERE account_id = NEW.id AND status = 'inactive';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to deactivate users automatically
DROP TRIGGER IF EXISTS trigger_deactivate_users_on_expiration ON public.accounts;
CREATE TRIGGER trigger_deactivate_users_on_expiration
  AFTER UPDATE OF status
  ON public.accounts
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION deactivate_users_on_account_expiration();

-- Create function to delete users scheduled for deletion
CREATE OR REPLACE FUNCTION delete_scheduled_users()
RETURNS TABLE(deleted_count INTEGER) AS $$
DECLARE
  count INTEGER;
BEGIN
  -- Delete users whose scheduled_deletion_at has passed
  WITH deleted AS (
    DELETE FROM public.account_users
    WHERE status = 'inactive' 
      AND scheduled_deletion_at IS NOT NULL 
      AND scheduled_deletion_at <= NOW()
    RETURNING *
  )
  SELECT COUNT(*)::INTEGER INTO count FROM deleted;
  
  RETURN QUERY SELECT count;
END;
$$ LANGUAGE plpgsql;

-- Create function to mark users as pending deletion (7 days before actual deletion)
CREATE OR REPLACE FUNCTION mark_users_pending_deletion()
RETURNS TABLE(marked_count INTEGER) AS $$
DECLARE
  count INTEGER;
BEGIN
  -- Mark users as pending_deletion 7 days before scheduled deletion
  WITH updated AS (
    UPDATE public.account_users
    SET 
      status = 'pending_deletion',
      updated_at = NOW()
    WHERE status = 'inactive' 
      AND scheduled_deletion_at IS NOT NULL 
      AND scheduled_deletion_at <= NOW() + INTERVAL '7 days'
      AND scheduled_deletion_at > NOW()
    RETURNING *
  )
  SELECT COUNT(*)::INTEGER INTO count FROM updated;
  
  RETURN QUERY SELECT count;
END;
$$ LANGUAGE plpgsql;

-- Create a view to easily see users lifecycle status
CREATE OR REPLACE VIEW user_lifecycle_status AS
SELECT 
  au.id,
  au.user_name,
  au.user_email,
  au.user_phone,
  au.status,
  au.deactivated_at,
  au.scheduled_deletion_at,
  CASE 
    WHEN au.scheduled_deletion_at IS NOT NULL THEN
      EXTRACT(DAY FROM (au.scheduled_deletion_at - NOW()))::INTEGER
    ELSE NULL
  END as days_until_deletion,
  a.id as account_id,
  c.name as customer_name,
  s.name as service_name,
  a.status as account_status,
  a.expiration_date
FROM public.account_users au
JOIN public.accounts a ON au.account_id = a.id
JOIN public.customers c ON a.customer_id = c.id
JOIN public.streaming_services s ON a.service_id = s.id
WHERE au.status IN ('inactive', 'pending_deletion')
ORDER BY au.scheduled_deletion_at ASC NULLS LAST;

-- Add comments
COMMENT ON COLUMN public.account_users.status IS 'User status: active (can use service), inactive (account expired), pending_deletion (will be deleted soon)';
COMMENT ON COLUMN public.account_users.deactivated_at IS 'When the user was deactivated due to account expiration';
COMMENT ON COLUMN public.account_users.scheduled_deletion_at IS 'When the user will be automatically deleted (2 months after deactivation)';
COMMENT ON FUNCTION delete_scheduled_users() IS 'Deletes users whose scheduled_deletion_at date has passed. Run this daily via cron job or API route.';
COMMENT ON FUNCTION mark_users_pending_deletion() IS 'Marks users as pending_deletion 7 days before scheduled deletion for notification purposes.';
COMMENT ON VIEW user_lifecycle_status IS 'Shows all inactive and pending deletion users with their deletion schedule';
