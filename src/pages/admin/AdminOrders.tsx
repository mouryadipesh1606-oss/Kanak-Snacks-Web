import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

interface Order {
  id: string;
  status: string;
  total_amount: number;
  created_at: string;
  table_id: string;
  tables: {
    name: string;
  } | null;
}

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        id,
        status,
        total_amount,
        created_at,
        table_id,
        tables (
          name
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to load orders');
    } else if (data) {
      setOrders(data as Order[]);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (orderId: string, status: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId);

    if (error) {
      toast.error('Failed to update status');
    } else {
      toast.success('Status updated');
      fetchOrders();
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Orders</h1>

      {orders.length === 0 ? (
        <p className="text-muted-foreground">No orders yet</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold">
                      Table: {order.tables?.name || 'Unknown'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      ₹{order.total_amount}
                    </p>
                  </div>
                  <span className="text-sm font-medium">
                    {order.status.toUpperCase()}
                  </span>
                </div>

                <div className="flex gap-2 flex-wrap">
                  <Button
                    size="sm"
                    onClick={() => updateStatus(order.id, 'preparing')}
                  >
                    Preparing
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => updateStatus(order.id, 'ready')}
                  >
                    Ready
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => updateStatus(order.id, 'served')}
                  >
                    Served
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => updateStatus(order.id, 'paid')}
                  >
                    Mark Paid
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
