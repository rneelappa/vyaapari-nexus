-- Create SKM Steels company
INSERT INTO public.companies (id, name, domain, description, is_active)
VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'SKM Steels',
  'skmsteels.com',
  'Leading steel manufacturing and trading company',
  true
);

-- Create SKM Impex Chennai division
INSERT INTO public.divisions (
  id,
  company_id,
  name,
  description,
  manager_name,
  status,
  budget,
  employee_count,
  performance_score,
  tally_enabled,
  tally_url,
  tally_company_id,
  is_active
)
VALUES (
  '650e8400-e29b-41d4-a716-446655440000',
  '550e8400-e29b-41d4-a716-446655440000',
  'SKM Impex Chennai',
  'Chennai branch handling import/export operations',
  'Rajesh Kumar',
  'active',
  5000000,
  45,
  92.5,
  true,
  'https://5fcc37ede06a.ngrok-free.app',
  'bc90d453-0c64-4f6f-8bbe-dca32aba40d1',
  true
);

-- Create a default workspace for the division
INSERT INTO public.workspaces (
  id,
  company_id,
  division_id,
  name,
  description,
  is_default
)
VALUES (
  '750e8400-e29b-41d4-a716-446655440000',
  '550e8400-e29b-41d4-a716-446655440000',
  '650e8400-e29b-41d4-a716-446655440000',
  'SKM Impex Chennai - Main',
  'Primary workspace for Chennai operations',
  true
);