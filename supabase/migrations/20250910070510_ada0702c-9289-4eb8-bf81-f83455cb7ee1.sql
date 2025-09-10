-- Add missing RLS policies for user_roles table INSERT operations
CREATE POLICY "Super admins can insert user roles" ON public.user_roles
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- Add default user role creation during signup (via trigger)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = 'public'
AS $$
BEGIN
  -- Create basic profile for new user
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email)
  )
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Create default user role only if no role exists for this user
  INSERT INTO public.user_roles (user_id, role)
  SELECT NEW.id, 'workspace_member'
  WHERE NOT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = NEW.id
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger for automatic user setup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();