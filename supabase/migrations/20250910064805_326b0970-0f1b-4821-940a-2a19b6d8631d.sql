-- Fix security issues identified by the linter

-- Fix 1: Add missing RLS policies for profiles table
CREATE POLICY "Profiles can be inserted during signup" ON public.profiles
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Fix 2: Update function search paths to be immutable
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.get_user_company_access(_user_id UUID)
RETURNS TABLE(company_id UUID, division_id UUID)
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT ur.company_id, ur.division_id
  FROM public.user_roles ur
  WHERE ur.user_id = _user_id
  AND ur.company_id IS NOT NULL
$$;

-- Fix the update_updated_at_column function as well
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;