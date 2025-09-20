-- Grant explicit permissions to authenticated users for troubleshooting
GRANT ALL ON public.companies TO authenticated;
GRANT ALL ON public.divisions TO authenticated;
GRANT ALL ON public.workspaces TO authenticated;
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.user_roles TO authenticated;
GRANT ALL ON public.workspace_members TO authenticated;

-- Also grant to anon role for debugging
GRANT SELECT ON public.companies TO anon;
GRANT SELECT ON public.divisions TO anon;
GRANT SELECT ON public.workspaces TO anon;