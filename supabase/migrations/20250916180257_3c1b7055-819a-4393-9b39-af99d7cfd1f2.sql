-- Fix RLS recursion and grant proper admin access for User Management

-- 1) Clean up any existing problematic policies on workspace_members to avoid recursion
DO $$
DECLARE p RECORD;
BEGIN
  FOR p IN SELECT schemaname, tablename, policyname
           FROM pg_policies 
           WHERE schemaname = 'public' AND tablename = 'workspace_members'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', p.policyname, p.schemaname, p.tablename);
  END LOOP;
END $$;

-- Ensure RLS is enabled
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;

-- Allow users to view ONLY their own memberships (no recursion)
CREATE POLICY "Users view their memberships"
ON public.workspace_members
FOR SELECT
USING (user_id = auth.uid());

-- Allow admins to manage all memberships
CREATE POLICY "Admins manage all memberships"
ON public.workspace_members
FOR ALL
USING (
  public.has_role(auth.uid(), 'company_admin') OR public.has_role(auth.uid(), 'division_admin')
)
WITH CHECK (
  public.has_role(auth.uid(), 'company_admin') OR public.has_role(auth.uid(), 'division_admin')
);

-- 2) Profiles: allow admins to view all profiles so User Management can list users
-- RLS already restricts users to their own profiles; keep that and add admin read access
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (
  public.has_role(auth.uid(), 'company_admin') OR public.has_role(auth.uid(), 'division_admin')
);

-- 3) User roles: ensure admins can manage, users can read their own
-- Drop existing policies for a clean slate (optional safety)
DO $$
DECLARE p RECORD;
BEGIN
  FOR p IN SELECT schemaname, tablename, policyname
           FROM pg_policies 
           WHERE schemaname = 'public' AND tablename = 'user_roles'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', p.policyname, p.schemaname, p.tablename);
  END LOOP;
END $$;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Admins manage all user roles"
ON public.user_roles
FOR ALL
USING (
  public.has_role(auth.uid(), 'company_admin') OR public.has_role(auth.uid(), 'division_admin')
)
WITH CHECK (
  public.has_role(auth.uid(), 'company_admin') OR public.has_role(auth.uid(), 'division_admin')
);
