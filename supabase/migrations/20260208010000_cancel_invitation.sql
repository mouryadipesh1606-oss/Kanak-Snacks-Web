CREATE OR REPLACE FUNCTION public.cancel_invitation(_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Only admin can cancel invites';
  END IF;

  UPDATE public.admin_invitations
  SET status = 'cancelled'
  WHERE id = _id;

  RETURN true;
END;
$$;
