-- Enable Row Level Security on all tables
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE streaming_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for customers table
-- Only authenticated users can view, insert, update, and delete customers
CREATE POLICY "Authenticated users can view customers" 
  ON customers FOR SELECT 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert customers" 
  ON customers FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update customers" 
  ON customers FOR UPDATE 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete customers" 
  ON customers FOR DELETE 
  USING (auth.role() = 'authenticated');

-- Create policies for streaming_services table
CREATE POLICY "Authenticated users can view services" 
  ON streaming_services FOR SELECT 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert services" 
  ON streaming_services FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update services" 
  ON streaming_services FOR UPDATE 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete services" 
  ON streaming_services FOR DELETE 
  USING (auth.role() = 'authenticated');

-- Create policies for accounts table
CREATE POLICY "Authenticated users can view accounts" 
  ON accounts FOR SELECT 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert accounts" 
  ON accounts FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update accounts" 
  ON accounts FOR UPDATE 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete accounts" 
  ON accounts FOR DELETE 
  USING (auth.role() = 'authenticated');

-- Create policies for account_users table
CREATE POLICY "Authenticated users can view account users" 
  ON account_users FOR SELECT 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert account users" 
  ON account_users FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update account users" 
  ON account_users FOR UPDATE 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete account users" 
  ON account_users FOR DELETE 
  USING (auth.role() = 'authenticated');

-- Create policies for notifications table
CREATE POLICY "Authenticated users can view notifications" 
  ON notifications FOR SELECT 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert notifications" 
  ON notifications FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update notifications" 
  ON notifications FOR UPDATE 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete notifications" 
  ON notifications FOR DELETE 
  USING (auth.role() = 'authenticated');
