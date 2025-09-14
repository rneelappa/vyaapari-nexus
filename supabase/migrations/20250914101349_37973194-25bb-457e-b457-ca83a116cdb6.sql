-- Fix voucher views creation issues - Part 1: Table privileges and constraints
-- 1. Grant table privileges to authenticated role
GRANT SELECT, INSERT, UPDATE, DELETE ON public.voucher_views TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.voucher_type_views TO authenticated;

-- 2. Add unique constraint to user_roles if it doesn't exist
ALTER TABLE public.user_roles 
ADD CONSTRAINT IF NOT EXISTS unique_user_role_scope 
UNIQUE (user_id, role, company_id, division_id);

-- 3. Add explicit user role for current user (using known user_id)
INSERT INTO public.user_roles (user_id, role, company_id, division_id)
VALUES (
  'bc37c1ea-1ec4-416a-ab7b-e324ed9ca41e'::uuid,
  'company_admin'::app_role,
  '629f49fb-983e-4141-8c48-e1423b39e921'::uuid,
  '37f3cc0c-58ad-4baf-b309-360116ffc3cd'::uuid
)
ON CONFLICT (user_id, role, company_id, division_id) DO NOTHING;