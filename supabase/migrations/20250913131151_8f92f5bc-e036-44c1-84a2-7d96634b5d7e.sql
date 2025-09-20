-- Set up cron job for Tally scheduler
-- This will run every minute and check which divisions need syncing

-- Schedule the tally-scheduler function to run every minute
SELECT cron.schedule(
  'tally-auto-sync',
  '* * * * *', -- Every minute
  $$
  SELECT
    net.http_post(
        url:='https://hycyhnjsldiokfkpqzoz.supabase.co/functions/v1/tally-scheduler',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5Y3lobmpzbGRpb2tma3Bxem96Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0NzQyMzksImV4cCI6MjA3MzA1MDIzOX0.pYalSrD_FP8tRY-bPCfFGbXavUq0eGwRmQUCIPnPxNk"}'::jsonb,
        body:='{"trigger": "cron"}'::jsonb
    ) as request_id;
  $$
);