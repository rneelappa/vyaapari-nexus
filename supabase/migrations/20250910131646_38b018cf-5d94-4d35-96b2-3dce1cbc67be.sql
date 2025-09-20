-- Fix edge function permissions - grant to service_role and authenticator
-- These are the actual roles used by edge functions

-- Grant to service_role (used by edge functions)
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- Grant to authenticator (backup role)
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticator;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticator;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticator;

-- Also grant to postgres role for completeness
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres;