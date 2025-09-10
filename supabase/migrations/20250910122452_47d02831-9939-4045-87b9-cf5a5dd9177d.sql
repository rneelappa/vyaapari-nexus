-- Add super_admin role to rajkumar.nr@gmail.com
INSERT INTO public.user_roles (user_id, role)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'rajkumar.nr@gmail.com'),
  'super_admin'::app_role
)
ON CONFLICT (user_id, role) DO NOTHING;