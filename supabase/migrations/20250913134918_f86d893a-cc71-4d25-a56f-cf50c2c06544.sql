-- Create cron job for health check every 5 minutes
SELECT cron.schedule(
  'tally-health-check',
  '*/5 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://hycyhnjsldiokfkpqzoz.supabase.co/functions/v1/tally-health-check',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5Y3lobmpzbGRpb2tma3Bxem96Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0NzQyMzksImV4cCI6MjA3MzA1MDIzOX0.pYalSrD_FP8tRY-bPCfFGbXavUq0eGwRmQUCIPnPxNk"}'::jsonb,
    body := '{"source": "cron"}'::jsonb
  ) as request_id;
  $$
);