-- Fix profiles RLS policy - the previous migration may have conflicts
-- Drop all existing policies on profiles to start clean
DO $$
DECLARE p RECORD;
BEGIN
  FOR p IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', p.policyname);
  END LOOP;
END $$;

-- Recreate profiles policies with proper access
CREATE POLICY "profiles_users_own"
ON public.profiles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "profiles_admins_all"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'super_admin')
  OR public.has_role(auth.uid(), 'company_admin')
  OR public.has_role(auth.uid(), 'division_admin')
);

CREATE POLICY "profiles_insert_own"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "profiles_update_own"
ON public.profiles
FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

-- Ensure user_roles policies allow super_admin to see all roles
DO $$
DECLARE p RECORD;
BEGIN
  FOR p IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_roles' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.user_roles', p.policyname);
  END LOOP;
END $$;

CREATE POLICY "user_roles_select_own_or_admin"
ON public.user_roles
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() 
  OR public.has_role(auth.uid(), 'super_admin')
  OR public.has_role(auth.uid(), 'company_admin')
  OR public.has_role(auth.uid(), 'division_admin')
);

CREATE POLICY "user_roles_manage_admin"
ON public.user_roles
FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'super_admin')
  OR public.has_role(auth.uid(), 'company_admin')
  OR public.has_role(auth.uid(), 'division_admin')
)
WITH CHECK (
  public.has_role(auth.uid(), 'super_admin')
  OR public.has_role(auth.uid(), 'company_admin')
  OR public.has_role(auth.uid(), 'division_admin')
);

-- Test the has_role function to make sure it works
DO $$
DECLARE
  test_result boolean;
  current_user_id uuid := 'bc37c1ea-1ec4-416a-ab7b-e324ed9ca41e'::uuid;
BEGIN
  SELECT public.has_role(current_user_id, 'super_admin') INTO test_result;
  IF test_result THEN
    RAISE NOTICE 'SUCCESS: has_role function works correctly for super_admin';
  ELSE
    RAISE WARNING 'ISSUE: has_role function not working for super_admin';
  END IF;
END $$;