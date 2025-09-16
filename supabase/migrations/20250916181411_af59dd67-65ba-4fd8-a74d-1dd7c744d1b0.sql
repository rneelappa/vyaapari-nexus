-- Phase 1: RLS and grants fixes for User Management
-- 0) Safety: create helper schema for migrations history if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_namespace WHERE nspname = 'supabase_migrations'
  ) THEN
    EXECUTE 'CREATE SCHEMA supabase_migrations';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'supabase_migrations' AND table_name = 'schema_migrations'
  ) THEN
    EXECUTE 'CREATE TABLE supabase_migrations.schema_migrations (version text primary key, name text, statements text[], created_by text, idempotency_key text unique)';
  END IF;
END $$;

-- 1) WORKSPACE MEMBERS: drop existing policies and recreate with clear non-recursive rules
DO $$
DECLARE p RECORD;
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'workspace_members'
  ) THEN
    FOR p IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'workspace_members' LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.workspace_members', p.policyname);
    END LOOP;

    ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;

    -- Users can see their own memberships; super_admin can see all
    CREATE POLICY "workspace_members_select"
    ON public.workspace_members
    FOR SELECT
    TO authenticated
    USING (
      user_id = auth.uid() 
      OR public.has_role(auth.uid(), 'super_admin')
    );

    -- Admins (including super_admin) can manage all memberships
    CREATE POLICY "workspace_members_manage"
    ON public.workspace_members
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

    -- Ensure privileges exist (RLS still enforced)
    GRANT SELECT, INSERT, UPDATE, DELETE ON public.workspace_members TO authenticated;
  END IF;
END $$;

-- 2) WORKSPACES: allow listing for members and super_admin
DO $$
DECLARE p RECORD;
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'workspaces'
  ) THEN
    FOR p IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'workspaces' LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.workspaces', p.policyname);
    END LOOP;

    ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "workspaces_select"
    ON public.workspaces
    FOR SELECT
    TO authenticated
    USING (
      public.has_role(auth.uid(), 'super_admin')
      OR EXISTS (
        SELECT 1 FROM public.workspace_members wm 
        WHERE wm.workspace_id = workspaces.id AND wm.user_id = auth.uid()
      )
    );

    GRANT SELECT ON public.workspaces TO authenticated;
  END IF;
END $$;

-- 3) PROFILES: ensure super_admin/admins can view all and users see their own
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'profiles'
  ) THEN
    DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

    -- Keep existing self-access policy as defined; add broader admin access including super_admin
    CREATE POLICY "Admins and super_admin can view all profiles"
    ON public.profiles
    FOR SELECT
    TO authenticated
    USING (
      user_id = auth.uid() 
      OR public.has_role(auth.uid(), 'super_admin')
      OR public.has_role(auth.uid(), 'company_admin')
      OR public.has_role(auth.uid(), 'division_admin')
    );
  END IF;
END $$;

-- 4) USER ROLES: users see own roles; admins (incl super_admin) manage all
DO $$
DECLARE p RECORD;
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'user_roles'
  ) THEN
    FOR p IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_roles' LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.user_roles', p.policyname);
    END LOOP;

    ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "user_roles_select"
    ON public.user_roles
    FOR SELECT
    TO authenticated
    USING (
      user_id = auth.uid() 
      OR public.has_role(auth.uid(), 'super_admin')
      OR public.has_role(auth.uid(), 'company_admin')
      OR public.has_role(auth.uid(), 'division_admin')
    );

    CREATE POLICY "user_roles_manage"
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
  END IF;
END $$;

-- Record migration in history (best-effort)
DO $$
DECLARE v_version text := to_char(current_timestamp, 'YYYYMMDDHH24MISS');
BEGIN
  INSERT INTO supabase_migrations.schema_migrations(version, name, statements, created_by, idempotency_key)
  VALUES (v_version, 'user_management_rls_grants', ARRAY['Implemented RLS and grants fixes for user management'], 'lovable', v_version)
  ON CONFLICT (idempotency_key) DO NOTHING;
END $$;