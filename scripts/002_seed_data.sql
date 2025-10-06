-- Insert default streaming services
INSERT INTO public.streaming_services (name) VALUES
  ('Netflix'),
  ('ChatGPT'),
  ('Spotify'),
  ('Disney+'),
  ('HBO Max'),
  ('Amazon Prime Video'),
  ('YouTube Premium'),
  ('Apple TV+')
ON CONFLICT (name) DO NOTHING;

-- Insert sample customers
INSERT INTO public.customers (name, phone, email) VALUES
  ('Juan Pérez', '+1234567890', 'juan@example.com'),
  ('María García', '+1234567891', 'maria@example.com'),
  ('Carlos López', '+1234567892', 'carlos@example.com')
ON CONFLICT DO NOTHING;

-- Insert sample accounts (using the first customer and first two services)
INSERT INTO public.accounts (customer_id, service_id, start_date, duration_days, credentials, notes)
SELECT 
  c.id,
  s.id,
  CURRENT_DATE - INTERVAL '25 days',
  30,
  'user@example.com / password123',
  'Cuenta de prueba'
FROM public.customers c
CROSS JOIN public.streaming_services s
WHERE c.name = 'Juan Pérez' AND s.name = 'Netflix'
LIMIT 1;

INSERT INTO public.accounts (customer_id, service_id, start_date, duration_days, credentials, notes)
SELECT 
  c.id,
  s.id,
  CURRENT_DATE - INTERVAL '27 days',
  30,
  'chatgpt@example.com / pass456',
  'Plan premium'
FROM public.customers c
CROSS JOIN public.streaming_services s
WHERE c.name = 'María García' AND s.name = 'ChatGPT'
LIMIT 1;
