-- Hacer que customer_id sea opcional en la tabla accounts
-- Esto permite crear cuentas sin asignar un cliente inicialmente

-- Eliminar la restricción NOT NULL de customer_id
ALTER TABLE public.accounts 
ALTER COLUMN customer_id DROP NOT NULL;

-- Agregar un comentario para documentar el cambio
COMMENT ON COLUMN public.accounts.customer_id IS 'Cliente asociado a la cuenta (opcional). Los usuarios se agregan directamente a la cuenta.';
