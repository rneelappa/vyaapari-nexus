-- Enable RLS on tables that need it and fix policies
ALTER TABLE public.divisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Fix divisions policies (they exist but RLS was disabled)
-- No need to recreate policies, just enable RLS

-- Fix companies policies (they exist but RLS was disabled) 
-- No need to recreate policies, just enable RLS

-- Create policies for user_roles
CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
TO authenticated 
USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own roles" 
ON public.user_roles 
FOR ALL 
TO authenticated 
USING (user_id = auth.uid());