-- Grant permissions to authenticated role for companies and divisions tables
GRANT ALL ON public.companies TO authenticated;
GRANT ALL ON public.divisions TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Also grant to anon role for public access if needed
GRANT SELECT ON public.companies TO anon;
GRANT SELECT ON public.divisions TO anon;