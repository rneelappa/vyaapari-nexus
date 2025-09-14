-- Create XML staging table for Tally imports with hierarchical structure
-- Drop existing table if it exists to start fresh
DROP TABLE IF EXISTS public.xml_staging CASCADE;

-- Create the table
CREATE TABLE public.xml_staging (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tag_name TEXT NOT NULL,
  tag_value TEXT,
  attributes JSONB,
  path TEXT NOT NULL,
  position INTEGER,
  parent_id UUID REFERENCES public.xml_staging(id) ON DELETE CASCADE,
  company_id UUID NOT NULL,
  division_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.xml_staging ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Authenticated can read xml staging"
ON public.xml_staging FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Service role manages xml staging"
ON public.xml_staging FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Create indexes
CREATE INDEX idx_xml_staging_company_division ON public.xml_staging (company_id, division_id);
CREATE INDEX idx_xml_staging_parent ON public.xml_staging (parent_id);
CREATE INDEX idx_xml_staging_tag ON public.xml_staging (tag_name);
CREATE INDEX idx_xml_staging_path ON public.xml_staging (path);

-- Create trigger for updated_at
CREATE TRIGGER trg_xml_staging_updated_at
BEFORE UPDATE ON public.xml_staging
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Helper function to clear staging data for a specific workspace
CREATE OR REPLACE FUNCTION public.reset_xml_staging(p_company_id UUID, p_division_id UUID)
RETURNS VOID AS $$
BEGIN
  DELETE FROM public.xml_staging
  WHERE company_id = p_company_id AND division_id = p_division_id;
END; $$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Helper function to insert a node
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