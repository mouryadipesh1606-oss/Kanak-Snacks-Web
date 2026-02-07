import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { UserPlus, Trash2, Copy, Mail, Users, Link2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface SubAdmin {
  user_id: string;
  email: string;
  role: string;
  created_at: string;
}

interface Invitation {
  id: string;
  email: string;
  token: string;
  status: string;
  created_at: string;
  expires_at: string;
}

const AdminSubAdmins = () => {
  const [subAdmins, setSubAdmins] = useState<SubAdmin[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');

  const fetchData = async () => {
    const [subAdminRes, invitationRes] = await Promise.all([
      supabase.rpc('get_sub_admins'),
      supabase
        .from('admin_invitations')
        .select('*')
        .order('created_at', { ascending: false }),
    ]);

    if (subAdminRes.data) setSubAdmins(subAdminRes.data);
    if (invitationRes.data) setInvitations(invitationRes.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setIsInviting(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        toast.error('Not authenticated');
        return;
      }

      const { data, error } = await supabase
        .from('admin_invitations')
        .insert({
          email: inviteEmail.trim().toLowerCase(),
          invited_by: session.user.id,
        })
        .select()
        .single();

      if (error) throw error;

      const link = `${window.location.origin}/admin?token=${data.token}`;
      setGeneratedLink(link);
      toast.success('Invitation created! Share the link with the sub-admin.');
      setInviteEmail('');
      fetchData();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to create invitation';
      toast.error(message);
    } finally {
      setIsInviting(false);
    }
  };

  const copyLink = (token: string) => {
    const link = `${window.location.origin}/admin?token=${token}`;
    navigator.clipboard.writeText(link);
    toast.success('Link copied to clipboard!');
  };

  const handleRemoveSubAdmin = async (userId: string, email: string) => {
    if (!confirm(`Are you sure you want to remove ${email} as sub-admin?`)) return;

    try {
      const { error } = await supabase.rpc('remove_sub_admin', {
        _target_user_id: userId,
      });

      if (error) throw error;

      toast.success(`${email} removed successfully.`);
      fetchData();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to remove sub-admin';
      toast.error(message);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const isExpired = (expiresAt: string) => new Date(expiresAt) < new Date();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">
            Sub-Admin Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Invite and manage sub-admins who can help manage the restaurant
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-accent rounded-xl">
              <UserPlus className="w-4 h-4 mr-2" />
              Invite Sub-Admin
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Invite Sub-Admin</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Email Address *</label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="sub-admin@example.com"
                    className="pl-10 rounded-xl"
                    required
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  The sub-admin must sign up with this exact email
                </p>
              </div>

              {generatedLink && (
                <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 space-y-2">
                  <p className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Link2 className="w-4 h-4" />
                    Invitation Link Generated!
                  </p>
                  <div className="flex gap-2">
                    <Input
                      value={generatedLink}
                      readOnly
                      className="rounded-xl text-xs"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="rounded-xl flex-shrink-0"
                      onClick={() => {
                        navigator.clipboard.writeText(generatedLink);
                        toast.success('Link copied!');
                      }}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Share this link with the sub-admin. It expires in 7 days.
                  </p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-primary text-primary-foreground hover:bg-accent rounded-xl"
                disabled={isInviting}
              >
                {isInviting ? 'Creating...' : 'Create Invitation'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-20 bg-card rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          {/* Active Sub-Admins */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Active Sub-Admins ({subAdmins.length})
            </h2>
            {subAdmins.length === 0 ? (
              <div className="text-center py-8 bg-card rounded-2xl">
                <p className="text-3xl mb-3">👥</p>
                <h3 className="text-lg font-semibold mb-1">No sub-admins yet</h3>
                <p className="text-muted-foreground text-sm">
                  Invite someone to help manage your restaurant
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {subAdmins.map((admin) => (
                  <div
                    key={admin.user_id}
                    className="bg-card rounded-2xl p-4 shadow-card flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Mail className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{admin.email}</p>
                        <p className="text-xs text-muted-foreground">
                          Added {formatDate(admin.created_at)}
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="rounded-xl"
                      onClick={() => handleRemoveSubAdmin(admin.user_id, admin.email)}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pending Invitations */}
          {invitations.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Link2 className="w-5 h-5 text-primary" />
                Invitations
              </h2>
              <div className="space-y-3">
                {invitations.map((inv) => (
                  <div
                    key={inv.id}
                    className="bg-card rounded-2xl p-4 shadow-card flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          inv.status === 'accepted'
                            ? 'bg-green-500/10'
                            : inv.status === 'pending' && !isExpired(inv.expires_at)
                            ? 'bg-primary/10'
                            : 'bg-muted'
                        }`}
                      >
                        <Mail
                          className={`w-5 h-5 ${
                            inv.status === 'accepted'
                              ? 'text-green-500'
                              : inv.status === 'pending' && !isExpired(inv.expires_at)
                              ? 'text-primary'
                              : 'text-muted-foreground'
                          }`}
                        />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{inv.email}</p>
                        <p className="text-xs text-muted-foreground">
                          {inv.status === 'accepted'
                            ? '✅ Accepted'
                            : inv.status === 'pending' && !isExpired(inv.expires_at)
                            ? `⏳ Pending · Expires ${formatDate(inv.expires_at)}`
                            : '❌ Expired'}
                        </p>
                      </div>
                    </div>
                    {inv.status === 'pending' && !isExpired(inv.expires_at) && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-xl"
                        onClick={() => copyLink(inv.token)}
                      >
                        <Copy className="w-4 h-4 mr-1" />
                        Copy Link
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminSubAdmins;
