import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UtensilsCrossed, Image, MessageSquare, TrendingUp } from 'lucide-react';

const AdminOverview = () => {
  const [stats, setStats] = useState({
    dishes: 0,
    gallery: 0,
    messages: 0,
    unreadMessages: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const [dishesRes, galleryRes, messagesRes, unreadRes] = await Promise.all([
        supabase.from('dishes').select('id', { count: 'exact', head: true }),
        supabase.from('gallery').select('id', { count: 'exact', head: true }),
        supabase.from('contact_submissions').select('id', { count: 'exact', head: true }),
        supabase.from('contact_submissions').select('id', { count: 'exact', head: true }).eq('is_read', false),
      ]);

      setStats({
        dishes: dishesRes.count || 0,
        gallery: galleryRes.count || 0,
        messages: messagesRes.count || 0,
        unreadMessages: unreadRes.count || 0,
      });
      setLoading(false);
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: 'Total Dishes',
      value: stats.dishes,
      icon: UtensilsCrossed,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Gallery Images',
      value: stats.gallery,
      icon: Image,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
    {
      title: 'Total Messages',
      value: stats.messages,
      icon: MessageSquare,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Unread Messages',
      value: stats.unreadMessages,
      icon: TrendingUp,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">
          Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">
          Welcome back! Here's an overview of your restaurant.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className="border-0 shadow-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-8 w-16 bg-muted animate-pulse rounded" />
              ) : (
                <div className="text-3xl font-bold text-foreground">{stat.value}</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-0 shadow-card">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Use the sidebar to manage your dishes, gallery photos, and view customer messages.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminOverview;
