-- Send notification to restart PostgREST schema cache
NOTIFY pgrst, 'reload schema';