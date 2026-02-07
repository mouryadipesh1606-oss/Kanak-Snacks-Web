-- Add explicit admin-only policies for user_roles table write operations
-- This makes security intentions clear and prevents accidental misconfigurations

-- Only admins can assign roles
CREATE POLICY "Admins can assign roles"
ON public.user_roles FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Only admins can modify roles
CREATE POLICY "Admins can modify roles"
ON public.user_roles FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Only admins can remove roles
CREATE POLICY "Admins can remove roles"
ON public.user_roles FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));