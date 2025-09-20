-- Assign super_admin role to rajkumar.nr@gmail.com
INSERT INTO public.user_roles (user_id, role, company_id, division_id)
SELECT 
  au.id,
  'super_admin'::app_role,
  NULL,
  NULL
FROM auth.users au
WHERE au.email = 'rajkumar.nr@gmail.com'
AND NOT EXISTS (
  SELECT 1 FROM public.user_roles ur 
  WHERE ur.user_id = au.id AND ur.role = 'super_admin'::app_role
);