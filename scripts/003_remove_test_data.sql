-- Remove test data from the database
-- This script removes all sample accounts, customers, and notifications
-- Keeps the streaming services as they are useful templates

-- Delete test notifications
DELETE FROM public.notifications 
WHERE account_id IN (
  SELECT a.id FROM public.accounts a
  JOIN public.customers c ON a.customer_id = c.id
  WHERE c.email LIKE '%@example.com'
);

-- Delete test accounts
DELETE FROM public.accounts 
WHERE customer_id IN (
  SELECT id FROM public.customers 
  WHERE email LIKE '%@example.com'
);

-- Delete test customers
DELETE FROM public.customers 
WHERE email LIKE '%@example.com';

-- Verify deletion
SELECT 
  (SELECT COUNT(*) FROM public.customers) as total_customers,
  (SELECT COUNT(*) FROM public.accounts) as total_accounts,
  (SELECT COUNT(*) FROM public.notifications) as total_notifications;
