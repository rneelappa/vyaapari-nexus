-- Recreate policies with explicit enum casts to app_role to fix RLS evaluation

-- PROFILES
DO $$
DECLARE p RECORD;
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='profiles') THEN
    FOR p IN SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename='profiles' LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', p.policyname);
    END LOOP;

    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

    CREATE POLICY profiles_self_select
    ON public.profiles
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

    CREATE POLICY profiles_admin_select
    ON public.profiles
    FOR SELECT TO authenticated
    USING (
      public.has_role(auth.uid(), 'super_admin'::app_role)
      OR public.has_role(auth.uid(), 'company_admin'::app_role)
      OR public.has_role(auth.uid(), 'division_admin'::app_role)
    );

    CREATE POLICY profiles_insert_own
    ON public.profiles
    FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid());

    CREATE POLICY profiles_update_own
    ON public.profiles
    FOR UPDATE TO authenticated
    USING (user_id = auth.uid());
  END IF;
END $$;

-- USER ROLES
DO $$
DECLARE p RECORD;
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='user_roles') THEN
    FOR p IN SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename='user_roles' LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.user_roles', p.policyname);
    END LOOP;

    ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

    CREATE POLICY user_roles_select_own_or_admin
    ON public.user_roles
    FOR SELECT TO authenticated
    USING (
      user_id = auth.uid()
      OR public.has_role(auth.uid(), 'super_admin'::app_role)
      OR public.has_role(auth.uid(), 'company_admin'::app_role)
      OR public.has_role(auth.uid(), 'division_admin'::app_role)
    );

    CREATE POLICY user_roles_manage_admin
    ON public.user_roles
    FOR ALL TO authenticated
    USING (
      public.has_role(auth.uid(), 'super_admin'::app_role)
      OR public.has_role(auth.uid(), 'company_admin'::app_role)
      OR public.has_role(auth.uid(), 'division_admin'::app_role)
    )
    WITH CHECK (
      public.has_role(auth.uid(), 'super_admin'::app_role)
      OR public.has_role(auth.uid(), 'company_admin'::app_role)
      OR public.has_role(auth.uid(), 'division_admin'::app_role)
    );
  END IF;
END $$;

-- WORKSPACE MEMBERS
DO $$
DECLARE p RECORD;
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='workspace_members') THEN
    FOR p IN SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename='workspace_members' LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.workspace_members', p.policyname);
    END LOOP;

    ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;

    CREATE POLICY workspace_members_select
    ON public.workspace_members
    FOR SELECT TO authenticated
    USING (
      user_id = auth.uid() 
      OR public.has_role(auth.uid(), 'super_admin'::app_role)
    );

    CREATE POLICY workspace_members_manage
    ON public.workspace_members
    FOR ALL TO authenticated
    USING (
      public.has_role(auth.uid(), 'super_admin'::app_role)
      OR public.has_role(auth.uid(), 'company_admin'::app_role)
      OR public.has_role(auth.uid(), 'division_admin'::app_role)
    )
    WITH CHECK (
      public.has_role(auth.uid(), 'super_admin'::app_role)
      OR public.has_role(auth.uid(), 'company_admin'::app_role)
      OR public.has_role(auth.uid(), 'division_admin'::app_role)
    );

    GRANT SELECT, INSERT, UPDATE, DELETE ON public.workspace_members TO authenticated;
  END IF;
END $$;

-- WORKSPACES
DO $$
DECLARE p RECORD;
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='workspaces') THEN
    FOR p IN SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename='workspaces' LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.workspaces', p.policyname);
    END LOOP;

    ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;

    CREATE POLICY workspaces_select
    ON public.workspaces
    FOR SELECT TO authenticated
    USING (
      public.has_role(auth.uid(), 'super_admin'::app_role)
      OR EXISTS (
        SELECT 1 FROM public.workspace_members wm 
        WHERE wm.workspace_id = workspaces.id AND wm.user_id = auth.uid()
      )
    );

    GRANT SELECT ON public.workspaces TO authenticated;
  END IF;
END $$;