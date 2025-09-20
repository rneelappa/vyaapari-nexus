-- Test the has_role function to debug the permission issue
SELECT 
  auth.uid() as current_user_id,
  has_role(auth.uid(), 'super_admin'::app_role) as is_super_admin,
  (SELECT count(*) FROM user_roles WHERE user_id = auth.uid() AND role = 'super_admin') as super_admin_count;