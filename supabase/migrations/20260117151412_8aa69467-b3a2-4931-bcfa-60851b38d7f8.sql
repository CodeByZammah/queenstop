-- Insert default analytics config
INSERT INTO public.site_config (config_key, config_value)
VALUES ('analytics', '{"ga_measurement_id": ""}'::jsonb)
ON CONFLICT (config_key) DO NOTHING;

-- Create the admin user (they will need to sign up first, then we add the role)
-- Note: The user webadmin@queenstop needs to sign up at /login first with password +260queenstop$$##
-- After signup, run this to make them admin:
-- INSERT INTO public.user_roles (user_id, role) 
-- SELECT id, 'admin' FROM auth.users WHERE email = 'webadmin@queenstop';