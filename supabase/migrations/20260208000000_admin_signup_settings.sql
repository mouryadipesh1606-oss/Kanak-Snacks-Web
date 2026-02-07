-- Create app settings table
CREATE TABLE IF NOT EXISTS public.app_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  admin_signup_open BOOLEAN DEFAULT true
);

-- Insert default row
INSERT INTO public.app_settings (id, admin_signup_open)
VALUES (1, true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can read setting
CREATE POLICY "Anyone can read settings"
ON public.app_settings
FOR SELECT
USING (true);

-- Only admin can update setting
CREATE POLICY "Admin can update settings"
ON public.app_settings
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- Function to check signup
CREATE OR REPLACE FUNCTION public.is_admin_signup_open()
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT admin_signup_open FROM public.app_settings WHERE id = 1;
$$;
