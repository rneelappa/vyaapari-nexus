-- Drop existing policies first
DROP POLICY IF EXISTS "Anyone can view companies" ON public.companies;
DROP POLICY IF EXISTS "Authenticated users can create companies" ON public.companies;
DROP POLICY IF EXISTS "Authenticated users can update companies" ON public.companies;
DROP POLICY IF EXISTS "Authenticated users can delete companies" ON public.companies;

DROP POLICY IF EXISTS "Anyone can view divisions" ON public.divisions;
DROP POLICY IF EXISTS "Authenticated users can create divisions" ON public.divisions;
DROP POLICY IF EXISTS "Authenticated users can update divisions" ON public.divisions;
DROP POLICY IF EXISTS "Authenticated users can delete divisions" ON public.divisions;

-- Create correct policies using auth.uid() instead of auth.role()
CREATE POLICY "Authenticated users can view companies" 
ON public.companies 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create companies" 
ON public.companies 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update companies" 
ON public.companies 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete companies" 
ON public.companies 
FOR DELETE 
USING (auth.uid() IS NOT NULL);

-- Create correct policies for divisions
CREATE POLICY "Authenticated users can view divisions" 
ON public.divisions 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create divisions" 
ON public.divisions 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update divisions" 
ON public.divisions 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete divisions" 
ON public.divisions 
FOR DELETE 
USING (auth.uid() IS NOT NULL);