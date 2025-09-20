-- Update the existing Engineering division to be SKM Impex Chennai
UPDATE public.divisions 
SET 
  name = 'SKM Impex Chennai',
  description = 'Chennai branch handling import/export operations',
  manager_name = 'Rajesh Kumar',
  budget = 5000000,
  employee_count = 45,
  performance_score = 92.5,
  tally_enabled = true,
  tally_url = 'https://5fcc37ede06a.ngrok-free.app',
  tally_company_id = 'bc90d453-0c64-4f6f-8bbe-dca32aba40d1'
WHERE id = '650e8400-e29b-41d4-a716-446655440000';

-- Update the company to be SKM Steels
UPDATE public.companies
SET 
  name = 'SKM Steels',
  domain = 'skmsteels.com',
  description = 'Leading steel manufacturing and trading company'
WHERE id = '550e8400-e29b-41d4-a716-446655440000';