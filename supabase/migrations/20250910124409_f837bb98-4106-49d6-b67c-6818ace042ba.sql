-- Enable Row Level Security on companies and divisions tables
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.divisions ENABLE ROW LEVEL SECURITY;

-- Create policies for companies table (allow all authenticated users to read all companies)
CREATE POLICY "Anyone can view companies" 
ON public.companies 
FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can create companies" 
ON public.companies 
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update companies" 
ON public.companies 
FOR UPDATE 
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete companies" 
ON public.companies 
FOR DELETE 
USING (auth.role() = 'authenticated');

-- Create policies for divisions table (allow all authenticated users to read all divisions)
CREATE POLICY "Anyone can view divisions" 
ON public.divisions 
FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can create divisions" 
ON public.divisions 
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update divisions" 
ON public.divisions 
FOR UPDATE 
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete divisions" 
ON public.divisions 
FOR DELETE 
USING (auth.role() = 'authenticated');