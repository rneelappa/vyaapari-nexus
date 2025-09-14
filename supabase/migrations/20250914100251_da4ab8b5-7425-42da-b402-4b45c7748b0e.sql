-- Enable RLS and add policies for voucher_views and voucher_type_views
-- Create the tables first if they don't exist
CREATE TABLE IF NOT EXISTS public.voucher_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  company_id UUID,
  division_id UUID,
  is_default BOOLEAN DEFAULT false,
  view_config JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.voucher_type_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  voucher_type_name TEXT NOT NULL,
  voucher_view_id UUID NOT NULL REFERENCES voucher_views(id) ON DELETE CASCADE,
  company_id UUID,
  division_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.voucher_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voucher_type_views ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view voucher views in scope or global" ON public.voucher_views;
DROP POLICY IF EXISTS "Users can insert voucher views in their scope" ON public.voucher_views;
DROP POLICY IF EXISTS "Users can update voucher views in their scope" ON public.voucher_views;
DROP POLICY IF EXISTS "Users can delete voucher views in their scope" ON public.voucher_views;

DROP POLICY IF EXISTS "Users can view voucher_type_views in scope or global" ON public.voucher_type_views;
DROP POLICY IF EXISTS "Users can insert voucher_type_views in their scope" ON public.voucher_type_views;
DROP POLICY IF EXISTS "Users can update voucher_type_views in their scope" ON public.voucher_type_views;
DROP POLICY IF EXISTS "Users can delete voucher_type_views in their scope" ON public.voucher_type_views;

-- voucher_views policies
CREATE POLICY "Users can view voucher views in scope or global" 
ON public.voucher_views
FOR SELECT
USING (
  auth.uid() IS NOT NULL AND (
    EXISTS (
      SELECT 1 FROM public.get_user_company_access(auth.uid()) a
      WHERE a.company_id = voucher_views.company_id AND a.division_id = voucher_views.division_id
    )
    OR (voucher_views.company_id IS NULL AND voucher_views.division_id IS NULL)
  )
);

CREATE POLICY "Users can insert voucher views in their scope" 
ON public.voucher_views
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.get_user_company_access(auth.uid()) a
    WHERE a.company_id = voucher_views.company_id AND a.division_id = voucher_views.division_id
  )
);

CREATE POLICY "Users can update voucher views in their scope" 
ON public.voucher_views
FOR UPDATE
USING (
  auth.uid() IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.get_user_company_access(auth.uid()) a
    WHERE a.company_id = voucher_views.company_id AND a.division_id = voucher_views.division_id
  )
)
WITH CHECK (
  auth.uid() IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.get_user_company_access(auth.uid()) a
    WHERE a.company_id = voucher_views.company_id AND a.division_id = voucher_views.division_id
  )
);

CREATE POLICY "Users can delete voucher views in their scope" 
ON public.voucher_views
FOR DELETE
USING (
  auth.uid() IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.get_user_company_access(auth.uid()) a
    WHERE a.company_id = voucher_views.company_id AND a.division_id = voucher_views.division_id
  )
);

-- voucher_type_views policies
CREATE POLICY "Users can view voucher_type_views in scope or global" 
ON public.voucher_type_views
FOR SELECT
USING (
  auth.uid() IS NOT NULL AND (
    EXISTS (
      SELECT 1 FROM public.get_user_company_access(auth.uid()) a
      WHERE a.company_id = voucher_type_views.company_id AND a.division_id = voucher_type_views.division_id
    )
    OR (voucher_type_views.company_id IS NULL AND voucher_type_views.division_id IS NULL)
  )
);

CREATE POLICY "Users can insert voucher_type_views in their scope" 
ON public.voucher_type_views
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.get_user_company_access(auth.uid()) a
    WHERE a.company_id = voucher_type_views.company_id AND a.division_id = voucher_type_views.division_id
  )
);

CREATE POLICY "Users can update voucher_type_views in their scope" 
ON public.voucher_type_views
FOR UPDATE
USING (
  auth.uid() IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.get_user_company_access(auth.uid()) a
    WHERE a.company_id = voucher_type_views.company_id AND a.division_id = voucher_type_views.division_id
  )
)
WITH CHECK (
  auth.uid() IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.get_user_company_access(auth.uid()) a
    WHERE a.company_id = voucher_type_views.company_id AND a.division_id = voucher_type_views.division_id
  )
);

CREATE POLICY "Users can delete voucher_type_views in their scope" 
ON public.voucher_type_views
FOR DELETE
USING (
  auth.uid() IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.get_user_company_access(auth.uid()) a
    WHERE a.company_id = voucher_type_views.company_id AND a.division_id = voucher_type_views.division_id
  )
);