-- Reset database and create new schema for Vyaapari360

-- Drop all existing tables in public schema to start fresh
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

-- Create custom types
CREATE TYPE public.app_role AS ENUM ('super_admin', 'company_admin', 'division_admin', 'workspace_member');
CREATE TYPE public.task_status AS ENUM ('todo', 'in_progress', 'done');
CREATE TYPE public.task_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE public.drive_item_type AS ENUM ('folder', 'file');

-- Create companies table
CREATE TABLE public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  domain TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID
);

-- Create divisions table
CREATE TABLE public.divisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  manager_name TEXT,
  status TEXT DEFAULT 'active',
  budget DECIMAL(15,2) DEFAULT 0,
  employee_count INTEGER DEFAULT 0,
  performance_score DECIMAL(3,2) DEFAULT 0,
  parent_division_id UUID REFERENCES public.divisions(id),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID
);

-- Create workspaces table
CREATE TABLE public.workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  division_id UUID REFERENCES public.divisions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID
);

-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  company_id UUID REFERENCES public.companies(id),
  division_id UUID REFERENCES public.divisions(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role public.app_role NOT NULL DEFAULT 'workspace_member',
  company_id UUID REFERENCES public.companies(id),
  division_id UUID REFERENCES public.divisions(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create workspace_members table
CREATE TABLE public.workspace_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  avatar_url TEXT,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  assigned_by UUID
);

-- Create messages table for workspace chat
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  user_name TEXT NOT NULL,
  content TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create tasks table
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status public.task_status NOT NULL DEFAULT 'todo',
  priority public.task_priority NOT NULL DEFAULT 'medium',
  assignee_id UUID,
  assignee_name TEXT,
  assignee_avatar TEXT,
  due_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID NOT NULL
);

-- Create drive_items table
CREATE TABLE public.drive_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type public.drive_item_type NOT NULL,
  file_type TEXT,
  size BIGINT,
  path TEXT NOT NULL,
  parent_path TEXT DEFAULT '/',
  storage_path TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID NOT NULL
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON public.companies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_divisions_updated_at BEFORE UPDATE ON public.divisions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_workspaces_updated_at BEFORE UPDATE ON public.workspaces FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_drive_items_updated_at BEFORE UPDATE ON public.drive_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.divisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drive_items ENABLE ROW LEVEL SECURITY;

-- Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to get user's company access
CREATE OR REPLACE FUNCTION public.get_user_company_access(_user_id UUID)
RETURNS TABLE(company_id UUID, division_id UUID)
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT ur.company_id, ur.division_id
  FROM public.user_roles ur
  WHERE ur.user_id = _user_id
  AND ur.company_id IS NOT NULL
$$;

-- RLS Policies for companies
CREATE POLICY "Super admins can manage all companies" ON public.companies
  FOR ALL USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Users can view their company" ON public.companies
  FOR SELECT USING (
    id IN (
      SELECT company_id FROM public.get_user_company_access(auth.uid())
      WHERE company_id IS NOT NULL
    )
  );

-- RLS Policies for divisions
CREATE POLICY "Super admins can manage all divisions" ON public.divisions
  FOR ALL USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Users can view divisions in their company" ON public.divisions
  FOR SELECT USING (
    company_id IN (
      SELECT company_id FROM public.get_user_company_access(auth.uid())
      WHERE company_id IS NOT NULL
    )
  );

-- RLS Policies for workspaces
CREATE POLICY "Super admins can manage all workspaces" ON public.workspaces
  FOR ALL USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Users can view workspaces they have access to" ON public.workspaces
  FOR SELECT USING (
    id IN (
      SELECT workspace_id FROM public.workspace_members 
      WHERE user_id = auth.uid()
    ) OR
    company_id IN (
      SELECT company_id FROM public.get_user_company_access(auth.uid())
      WHERE company_id IS NOT NULL
    )
  );

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (user_id = auth.uid());

-- RLS Policies for user_roles
CREATE POLICY "Super admins can manage all user roles" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT USING (user_id = auth.uid());

-- RLS Policies for workspace_members
CREATE POLICY "Super admins can manage all workspace members" ON public.workspace_members
  FOR ALL USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Users can view their workspace memberships" ON public.workspace_members
  FOR SELECT USING (user_id = auth.uid());

-- RLS Policies for messages
CREATE POLICY "Users can view messages in their workspaces" ON public.messages
  FOR SELECT USING (
    workspace_id IN (
      SELECT workspace_id FROM public.workspace_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create messages in their workspaces" ON public.messages
  FOR INSERT WITH CHECK (
    workspace_id IN (
      SELECT workspace_id FROM public.workspace_members 
      WHERE user_id = auth.uid()
    ) AND user_id = auth.uid()
  );

-- RLS Policies for tasks
CREATE POLICY "Users can manage tasks in their workspaces" ON public.tasks
  FOR ALL USING (
    workspace_id IN (
      SELECT workspace_id FROM public.workspace_members 
      WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for drive_items
CREATE POLICY "Users can manage drive items in their workspaces" ON public.drive_items
  FOR ALL USING (
    workspace_id IN (
      SELECT workspace_id FROM public.workspace_members 
      WHERE user_id = auth.uid()
    )
  );

-- Insert seed data
-- Companies
INSERT INTO public.companies (id, name, description, domain) VALUES
  ('550e8400-e29b-41d4-a716-446655440000', 'Acme Corporation', 'A leading technology company', 'acme.com'),
  ('550e8400-e29b-41d4-a716-446655440001', 'TechStart Inc', 'Innovative startup solutions', 'techstart.com');

-- Divisions
INSERT INTO public.divisions (id, company_id, name, description, manager_name, status, budget, employee_count, performance_score) VALUES
  ('650e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', 'Engineering', 'Product development and technical innovation', 'John Smith', 'active', 2500000.00, 45, 4.2),
  ('650e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'Marketing', 'Brand promotion and customer acquisition', 'Sarah Johnson', 'active', 1800000.00, 28, 3.8),
  ('650e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'Product', 'Product strategy and user experience', 'Mike Chen', 'active', 2200000.00, 32, 4.5);

-- Workspaces
INSERT INTO public.workspaces (id, company_id, division_id, name, description) VALUES
  ('750e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', '650e8400-e29b-41d4-a716-446655440000', 'Web Development', 'Frontend and backend web development projects'),
  ('750e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', '650e8400-e29b-41d4-a716-446655440000', 'Mobile Apps', 'iOS and Android application development'),
  ('750e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', '650e8400-e29b-41d4-a716-446655440001', 'Digital Campaigns', 'Online marketing and advertising campaigns'),
  ('750e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440002', 'Design System', 'UI/UX design and component library');

-- Sample workspace members
INSERT INTO public.workspace_members (workspace_id, user_id, role, avatar_url) VALUES
  ('750e8400-e29b-41d4-a716-446655440000', '850e8400-e29b-41d4-a716-446655440000', 'admin', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'),
  ('750e8400-e29b-41d4-a716-446655440000', '850e8400-e29b-41d4-a716-446655440001', 'member', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'),
  ('750e8400-e29b-41d4-a716-446655440001', '850e8400-e29b-41d4-a716-446655440002', 'admin', 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80');

-- Sample messages
INSERT INTO public.messages (workspace_id, user_id, user_name, content, avatar_url) VALUES
  ('750e8400-e29b-41d4-a716-446655440000', '850e8400-e29b-41d4-a716-446655440000', 'Alex Johnson', 'Hey team, how''s the new feature coming along?', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'),
  ('750e8400-e29b-41d4-a716-446655440000', '850e8400-e29b-41d4-a716-446655440001', 'Sarah Chen', 'Making good progress! Should have the MVP ready by Friday.', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'),
  ('750e8400-e29b-41d4-a716-446655440000', '850e8400-e29b-41d4-a716-446655440000', 'Alex Johnson', 'Awesome! Let me know if you need any help with testing.', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80');

-- Sample tasks
INSERT INTO public.tasks (workspace_id, title, description, status, priority, assignee_name, assignee_avatar, due_date, created_by) VALUES
  ('750e8400-e29b-41d4-a716-446655440000', 'Design new user dashboard', 'Create wireframes and mockups for the updated user dashboard', 'in_progress', 'high', 'Sarah Chen', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80', '2024-02-15', '850e8400-e29b-41d4-a716-446655440000'),
  ('750e8400-e29b-41d4-a716-446655440000', 'Implement authentication system', 'Set up user login, registration, and password reset functionality', 'todo', 'high', 'Mike Rodriguez', 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80', '2024-02-20', '850e8400-e29b-41d4-a716-446655440000'),
  ('750e8400-e29b-41d4-a716-446655440000', 'Write API documentation', 'Document all REST API endpoints with examples', 'done', 'medium', 'Alex Johnson', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80', '2024-02-10', '850e8400-e29b-41d4-a716-446655440001');

-- Sample drive items
INSERT INTO public.drive_items (workspace_id, name, type, file_type, size, path, created_by) VALUES
  ('750e8400-e29b-41d4-a716-446655440000', 'Project Assets', 'folder', NULL, NULL, '/Project Assets', '850e8400-e29b-41d4-a716-446655440000'),
  ('750e8400-e29b-41d4-a716-446655440000', 'Design Mockups', 'folder', NULL, NULL, '/Design Mockups', '850e8400-e29b-41d4-a716-446655440000'),
  ('750e8400-e29b-41d4-a716-446655440000', 'project-spec.pdf', 'file', 'PDF', 2048576, '/project-spec.pdf', '850e8400-e29b-41d4-a716-446655440000'),
  ('750e8400-e29b-41d4-a716-446655440000', 'wireframes.sketch', 'file', 'Sketch', 8192000, '/Design Mockups/wireframes.sketch', '850e8400-e29b-41d4-a716-446655440001'),
  ('750e8400-e29b-41d4-a716-446655440000', 'logo.png', 'file', 'PNG', 512000, '/Project Assets/logo.png', '850e8400-e29b-41d4-a716-446655440001');