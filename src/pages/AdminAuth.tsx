import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Lock, Mail, UserPlus, LogIn, AlertCircle } from 'lucide-react';

const AdminAuth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get('token');

  const [isLogin, setIsLogin] = useState(!inviteToken);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteValid, setInviteValid] = useState<boolean | null>(null);
  const [checkingInvite, setCheckingInvite] = useState(!!inviteToken);

  // Check invitation validity
  useEffect(() => {
    if (!inviteToken) return;

    const checkInvite = async () => {
      const { data, error } = await supabase.rpc('check_invitation', {
        invite_token: inviteToken,
      });

      const result = data as unknown as { valid: boolean; email?: string } | null;

      if (!error && result?.valid && result.email) {
        setInviteEmail(result.email);
        setEmail(result.email);
        setInviteValid(true);
      } else {
        setInviteValid(false);
      }
      setCheckingInvite(false);
    };

    checkInvite();
  }, [inviteToken]);

  // Check existing session
  useEffect(() => {
    const checkAndRedirect = async (userId: string) => {
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();

      if (roleData && (roleData.role === 'admin' || roleData.role === 'sub_admin')) {
        navigate('/admin/dashboard');
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          setTimeout(() => checkAndRedirect(session.user.id), 0);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        checkAndRedirect(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      await supabase.rpc('handle_signup_role_assignment');
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', data.user.id)
        .maybeSingle();

      if (!roleData || (roleData.role !== 'admin' && roleData.role !== 'sub_admin')) {
        await supabase.auth.signOut();
        toast.error('Access denied. Admin privileges required.');
        return;
      }

      toast.success('Welcome back!');
      navigate('/admin/dashboard');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Authentication failed';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

 const handleSignup = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);

  try {
    // Check if admin signup is open
    const { data: signupOpen } = await supabase.rpc('is_admin_signup_open');

    if (!signupOpen) {
      toast.error('Admin signup is currently closed.');
      setIsLoading(false);
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/admin`,
      },
    });

    if (error) throw error;

    toast.success(
      'Verification link sent. Please confirm your email, then log in.'
    );

    // switch to login tab
    setIsLogin(true);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Signup failed';
    toast.error(message);
  } finally {
    setIsLoading(false);
  }
};


  if (checkingInvite) {
    return (
      <div className="min-h-screen bg-charcoal flex items-center justify-center">
        <div className="animate-pulse text-cream/70">Checking invitation...</div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Admin Login - Kanak Snacks</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-charcoal flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-display font-bold text-primary mb-2">
              Kanak Snacks
            </h1>
            <p className="text-cream/70">Admin Panel</p>
          </div>

          {/* Invitation Banner */}
          {inviteToken && inviteValid === false && (
            <div className="bg-destructive/20 border border-destructive/30 rounded-2xl p-4 mb-6 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-cream font-medium text-sm">Invalid or Expired Invitation</p>
                <p className="text-cream/70 text-xs mt-1">
                  This invitation link is no longer valid. Please contact the admin for a new one.
                </p>
              </div>
            </div>
          )}

          {inviteToken && inviteValid && (
            <div className="bg-primary/20 border border-primary/30 rounded-2xl p-4 mb-6 flex items-start gap-3">
              <UserPlus className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-cream font-medium text-sm">You've been invited!</p>
                <p className="text-cream/70 text-xs mt-1">
                  Create an account with <span className="text-primary font-medium">{inviteEmail}</span> to accept the invitation.
                </p>
              </div>
            </div>
          )}

          <div className="bg-card rounded-2xl p-8 shadow-lg">
            {/* Tab Toggle */}
            <div className="flex gap-2 mb-6 bg-muted rounded-xl p-1">
              <button
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                  isLogin
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <LogIn className="w-4 h-4 inline mr-2" />
                Login
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                  !isLogin
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <UserPlus className="w-4 h-4 inline mr-2" />
                Sign Up
              </button>
            </div>

            <h2 className="text-xl font-semibold text-card-foreground mb-6 text-center">
              {isLogin ? 'Admin Sign In' : 'Admin Sign Up'}
            </h2>

            <form onSubmit={isLogin ? handleLogin : handleSignup} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="pl-10 rounded-xl"
                    required
                    readOnly={!!inviteToken && inviteValid === true}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="pl-10 rounded-xl"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-primary text-primary-foreground hover:bg-accent rounded-xl py-6"
                disabled={isLoading}
              >
                {isLoading
                  ? isLogin ? 'Signing in...' : 'Creating account...'
                  : isLogin ? 'Sign In' : 'Create Account'}
              </Button>
            </form>

           <p className="mt-4 text-center text-sm text-muted-foreground">
  {isLogin ? (
    <>
      First time? Switch to Sign Up to create your admin account.
      <br />
      <button
        onClick={() => navigate('/admin/forgot-password')}
        className="text-primary hover:underline mt-2"
        type="button"
      >
        Forgot password?
      </button>
    </>
  ) : (
    'Already have an account? Switch to Login.'
  )}
</p>

          </div>

          <p className="text-center text-cream/50 text-sm mt-6">
            {!isLogin
              ? 'First signup becomes the main admin. Others need an invitation.'
              : 'Only authorized administrators can access this area.'}
          </p>
        </div>
      </div>
    </>
  );
};

export default AdminAuth;
