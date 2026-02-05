-- Reemplaza 'tu_email@ejemplo.com' con tu correo real
UPDATE public.users
SET role = 'admin'
WHERE email = 'tu_email@ejemplo.com';

-- Opcional: Si usas metadatos de usuario en Auth
UPDATE auth.users
SET raw_user_meta_data = 
  CASE 
    WHEN raw_user_meta_data IS NULL THEN '{"role": "admin"}'::jsonb
    ELSE jsonb_set(raw_user_meta_data, '{role}', '"admin"')
  END
WHERE email = 'tu_email@ejemplo.com';
