-- Remove all policies from tables where RLS is disabled
DROP POLICY IF EXISTS "Super admins can manage all companies" ON public.companies;
DROP POLICY IF EXISTS "Users can view their company" ON public.companies;
DROP POLICY IF EXISTS "Super admins can manage all divisions" ON public.divisions;
DROP POLICY IF EXISTS "Users can view divisions in their company" ON public.divisions;
DROP POLICY IF EXISTS "Super admins can insert user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Super admins can manage all user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;