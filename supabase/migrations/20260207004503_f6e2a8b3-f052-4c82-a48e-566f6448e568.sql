
-- 1. Create helper function for admin/sub_admin access check
CREATE OR REPLACE FUNCTION public.has_admin_access(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('admin', 'sub_admin')
  )
$$;

-- 2. Create admin_invitations table
CREATE TABLE public.admin_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  token text NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  invited_by uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days')
);

ALTER TABLE public.admin_invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage invitations"
ON public.admin_invitations
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 3. Function to handle role assignment after signup
CREATE OR REPLACE FUNCTION public.handle_signup_role_assignment()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id uuid := auth.uid();
  _email text;
  invitation_record RECORD;
  existing_role text;
BEGIN
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  SELECT role::text INTO existing_role FROM public.user_roles WHERE user_id = _user_id LIMIT 1;
  IF existing_role IS NOT NULL THEN
    RETURN existing_role;
  END IF;
  
  SELECT email INTO _email FROM auth.users WHERE id = _user_id;
  
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (_user_id, 'admin');
    RETURN 'admin';
  END IF;
  
  SELECT * INTO invitation_record
  FROM public.admin_invitations
  WHERE email = _email
    AND status = 'pending'
    AND expires_at > now()
  ORDER BY created_at DESC
  LIMIT 1;
  
  IF FOUND THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (_user_id, 'sub_admin');
    UPDATE public.admin_invitations SET status = 'accepted' WHERE id = invitation_record.id;
    RETURN 'sub_admin';
  END IF;
  
  RETURN 'none';
END;
$$;

-- 4. Check invitation validity by token (no auth needed)
CREATE OR REPLACE FUNCTION public.check_invitation(invite_token text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    'valid', true,
    'email', ai.email
  ) INTO result
  FROM public.admin_invitations ai
  WHERE ai.token = invite_token
    AND ai.status = 'pending'
    AND ai.expires_at > now();
  
  IF result IS NULL THEN
    RETURN json_build_object('valid', false);
  END IF;
  
  RETURN result;
END;
$$;

-- 5. Get sub-admin list (admin only)
CREATE OR REPLACE FUNCTION public.get_sub_admins()
RETURNS TABLE(user_id uuid, email text, role text, created_at timestamptz)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT ur.user_id, au.email, ur.role::text, ur.created_at
  FROM public.user_roles ur
  JOIN auth.users au ON au.id = ur.user_id
  WHERE ur.role = 'sub_admin'
  ORDER BY ur.created_at DESC
$$;

-- 6. Remove sub-admin (admin only)
CREATE OR REPLACE FUNCTION public.remove_sub_admin(_target_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Only admins can remove sub-admins';
  END IF;
  
  IF has_role(_target_user_id, 'admin'::app_role) THEN
    RAISE EXCEPTION 'Cannot remove an admin';
  END IF;
  
  DELETE FROM public.user_roles WHERE user_id = _target_user_id AND role = 'sub_admin';
  RETURN true;
END;
$$;

-- 7. Update RLS policies - dishes
DROP POLICY IF EXISTS "Admins can manage dishes" ON public.dishes;
CREATE POLICY "Admin access can manage dishes"
ON public.dishes
FOR ALL
USING (has_admin_access(auth.uid()))
WITH CHECK (has_admin_access(auth.uid()));

-- 8. Update RLS policies - categories
DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;
CREATE POLICY "Admin access can manage categories"
ON public.categories
FOR ALL
USING (has_admin_access(auth.uid()))
WITH CHECK (has_admin_access(auth.uid()));

-- 9. Update RLS policies - gallery
DROP POLICY IF EXISTS "Admins can manage gallery" ON public.gallery;
CREATE POLICY "Admin access can manage gallery"
ON public.gallery
FOR ALL
USING (has_admin_access(auth.uid()))
WITH CHECK (has_admin_access(auth.uid()));

-- 10. Update contact_submissions policies
DROP POLICY IF EXISTS "Admins can view submissions" ON public.contact_submissions;
DROP POLICY IF EXISTS "Admins can update submissions" ON public.contact_submissions;
DROP POLICY IF EXISTS "Admins can delete submissions" ON public.contact_submissions;

CREATE POLICY "Admin access can view submissions"
ON public.contact_submissions
FOR SELECT
USING (has_admin_access(auth.uid()));

CREATE POLICY "Admin access can update submissions"
ON public.contact_submissions
FOR UPDATE
USING (has_admin_access(auth.uid()));

CREATE POLICY "Admin access can delete submissions"
ON public.contact_submissions
FOR DELETE
USING (has_admin_access(auth.uid()));

-- 11. Allow admins to view all user_roles
CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));
