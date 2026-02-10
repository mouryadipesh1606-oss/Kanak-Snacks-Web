import { useState, useEffect } from 'react';
import { useNavigate, Outlet, Link, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/integrations/supabase/client';
import { 
  LayoutDashboard, 
  UtensilsCrossed, 
  Image, 
  MessageSquare, 
  LogOut,
  Menu,
  X,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [signupOpen, setSignupOpen] = useState<boolean | null>(null);


  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        navigate('/admin');
        return;
      }

      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (!roleData || (roleData.role !== 'admin' && roleData.role !== 'sub_admin')) {
        await supabase.auth.signOut();
        navigate('/admin');
        toast.error('Access denied');
        return;
      }

      setUserRole(roleData.role);
      setLoading(false);
    };

    checkAuth();
// Fetch signup setting
const fetchSignupSetting = async () => {
  const { data } = await supabase
    .from('app_settings')
    .select('admin_signup_open')
    .eq('id', 1)
    .single();

  if (data) {
    setSignupOpen(data.admin_signup_open);
  }
};
    fetchSignupSetting();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event) => {
        if (event === 'SIGNED_OUT') {
          navigate('/admin');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin');
  };

  const toggleSignup = async () => {
  if (signupOpen === null) return;

  const { error } = await supabase
    .from('app_settings')
    .update({ admin_signup_open: !signupOpen })
    .eq('id', 1);

  if (!error) {
    setSignupOpen(!signupOpen);
    toast.success(
      !signupOpen
        ? 'Admin signup opened'
        : 'Admin signup closed'
    );
  } else {
    toast.error('Failed to update setting');
  }
};


  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Dishes', path: '/admin/dashboard/dishes', icon: UtensilsCrossed },
    { name: 'Gallery', path: '/admin/dashboard/gallery', icon: Image },
    { name: 'Messages', path: '/admin/dashboard/messages', icon: MessageSquare },
     { name: 'Tables', path: '/admin/dashboard/tables', icon: LayoutDashboard },
  { name: 'Orders', path: '/admin/dashboard/orders', icon: UtensilsCrossed },
    // Sub-admin management only visible to main admin
    ...(userRole === 'admin'
      ? [{ name: 'Sub-Admins', path: '/admin/dashboard/sub-admins', icon: Users }]
      : []),
  ];

  const isActive = (path: string) => location.pathname === path;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Admin Dashboard - Kanak Snacks</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-secondary flex">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-64 bg-charcoal transform transition-transform duration-300 lg:translate-x-0 ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="p-6 border-b border-cream/10">
              <Link to="/" className="flex items-center gap-2">
                <span className="text-2xl font-display font-bold text-primary">Kanak</span>
                <span className="text-lg font-light text-cream">Admin</span>
              </Link>
              {userRole === 'sub_admin' && (
                <span className="text-xs text-primary/70 mt-1 block">Sub-Admin</span>
              )}
            </div>

            {/* Nav */}
            <nav className="flex-1 p-4 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                    isActive(item.path)
                      ? 'bg-primary text-primary-foreground'
                      : 'text-cream/70 hover:bg-cream/10 hover:text-cream'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </Link>
              ))}
            </nav>
            
  {userRole === 'admin' && signupOpen !== null && (
  <Button
    onClick={toggleSignup}
    variant="ghost"
    className="w-full justify-start text-cream/70 hover:text-cream hover:bg-cream/10 mb-2"
  >
    {signupOpen ? 'Close Admin Signup' : 'Open Admin Signup'}
  </Button>
)}

            {/* Logout */}
            <div className="p-4 border-t border-cream/10">
              <Button
                onClick={handleLogout}
                variant="ghost"
                className="w-full justify-start text-cream/70 hover:text-cream hover:bg-cream/10"
              >
                <LogOut className="w-5 h-5 mr-3" />
                Sign Out
              </Button>
            </div>
          </div>
        </aside>

        {/* Overlay */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-charcoal/50 z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 lg:ml-64">
          {/* Top Bar */}
          <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b px-4 py-3 flex items-center justify-between lg:justify-end">
            <button
              className="lg:hidden p-2 text-foreground"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <Link to="/" className="text-sm text-muted-foreground hover:text-primary">
              View Website →
            </Link>
          </header>

          {/* Page Content */}
          <main className="p-4 md:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
