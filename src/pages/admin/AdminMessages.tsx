import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Mail, Phone, Check, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface Message {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  created_at: string;
  is_read: boolean;
}

const AdminMessages = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from('contact_submissions')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) setMessages(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const markAsRead = async (id: string) => {
    const { error } = await supabase
      .from('contact_submissions')
      .update({ is_read: true })
      .eq('id', id);

    if (error) {
      toast.error('Failed to update message');
      return;
    }

    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, is_read: true } : m))
    );
  };

  const deleteMessage = async (id: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;

    const { error } = await supabase
      .from('contact_submissions')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete message');
      return;
    }

    toast.success('Message deleted');
    fetchMessages();
  };

  const unreadCount = messages.filter((m) => !m.is_read).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">
            Messages
          </h1>
          <p className="text-muted-foreground mt-1">
            {unreadCount > 0 ? `${unreadCount} unread message${unreadCount > 1 ? 's' : ''}` : 'No new messages'}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-card rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : messages.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-2xl">
          <p className="text-4xl mb-4">📬</p>
          <h3 className="text-xl font-semibold mb-2">No messages yet</h3>
          <p className="text-muted-foreground">Messages from the contact form will appear here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`bg-card rounded-2xl p-5 shadow-card ${
                !msg.is_read ? 'border-l-4 border-primary' : ''
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-foreground">{msg.name}</h3>
                    {!msg.is_read && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                        New
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-3">
                    <a href={`mailto:${msg.email}`} className="flex items-center gap-1 hover:text-primary">
                      <Mail className="w-4 h-4" />
                      {msg.email}
                    </a>
                    {msg.phone && (
                      <a href={`tel:${msg.phone}`} className="flex items-center gap-1 hover:text-primary">
                        <Phone className="w-4 h-4" />
                        {msg.phone}
                      </a>
                    )}
                  </div>
                  <p className="text-foreground whitespace-pre-wrap">{msg.message}</p>
                  <p className="text-xs text-muted-foreground mt-3">
                    {format(new Date(msg.created_at), 'PPpp')}
                  </p>
                </div>
                <div className="flex gap-2">
                  {!msg.is_read && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-xl"
                      onClick={() => markAsRead(msg.id)}
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Mark Read
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="destructive"
                    className="rounded-xl"
                    onClick={() => deleteMessage(msg.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminMessages;
