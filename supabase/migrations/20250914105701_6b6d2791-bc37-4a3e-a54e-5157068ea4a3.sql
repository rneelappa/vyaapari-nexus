-- Create XML staging table for Tally imports
-- This table stores flattened XML nodes with parent-child relationships

-- 1) Helper function for updated_at if not exists
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- 2) Table
CREATE TABLE IF NOT EXISTS public.xml_staging (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tag_name TEXT NOT NULL,
  tag_value TEXT,
  attributes JSONB,
  path TEXT NOT NULL,               -- XPath-like path for fast lookup e.g. /ENVELOPE/BODY/DATA/VOUCHER
  position INTEGER,                 -- Order among siblings
  parent_id UUID REFERENCES public.xml_staging(id) ON DELETE CASCADE,
  company_id UUID NOT NULL,
  division_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3) Trigger for updated_at
DROP TRIGGER IF EXISTS trg_xml_staging_updated_at ON public.xml_staging;
CREATE TRIGGER trg_xml_staging_updated_at
BEFORE UPDATE ON public.xml_staging
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 4) Indexes for performance
CREATE INDEX IF NOT EXISTS idx_xml_staging_company_division ON public.xml_staging (company_id, division_id);
CREATE INDEX IF NOT EXISTS idx_xml_staging_parent ON public.xml_staging (parent_id);
CREATE INDEX IF NOT EXISTS idx_xml_staging_path ON public.xml_staging USING GIN (to_tsvector('simple', path));
CREATE INDEX IF NOT EXISTS idx_xml_staging_tag ON public.xml_staging (tag_name);

-- 5) RLS
ALTER TABLE public.xml_staging ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read
DROP POLICY IF EXISTS "Authenticated can read xml staging" ON public.xml_staging;
CREATE POLICY "Authenticated can read xml staging"
ON public.xml_staging FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Service role can manage everything
DROP POLICY IF EXISTS "Service role manages xml staging" ON public.xml_staging;
CREATE POLICY "Service role manages xml staging"
ON public.xml_staging FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- 6) Helper function to replace data for a workspace (safer than truncating entire table)
CREATE OR REPLACE FUNCTION public.reset_xml_staging(p_company_id UUID, p_division_id UUID)
RETURNS VOID AS $$
BEGIN
  DELETE FROM public.xml_staging
  WHERE company_id = p_company_id AND division_id = p_division_id;
END; $$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 7) Helper function to insert a node
-- This is optional but useful for edge function imports
CREATE OR REPLACE FUNCTION public.insert_xml_node(
  p_tag_name TEXT,
  p_tag_value TEXT,
  p_attributes JSONB,
  p_path TEXT,
  p_position INTEGER,
  p_parent_id UUID,
  p_company_id UUID,
  p_division_id UUID
) RETURNS UUID AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO public.xml_staging (
    tag_name, tag_value, attributes, path, position, parent_id, company_id, division_id
  ) VALUES (
    p_tag_name, p_tag_value, p_attributes, p_path, p_position, p_parent_id, p_company_id, p_division_id
  ) RETURNING id INTO v_id;
  RETURN v_id;
END; $$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;