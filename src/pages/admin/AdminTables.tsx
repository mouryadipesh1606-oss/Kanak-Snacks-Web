import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface Table {
  id: string;
  name: string;
}

const AdminTables = () => {
  const [tables, setTables] = useState<Table[]>([]);
  const [newTable, setNewTable] = useState('');

  const fetchTables = async () => {
    const { data } = await supabase
      .from('tables')
      .select('*')
      .order('created_at');

    if (data) setTables(data);
  };

  useEffect(() => {
    fetchTables();
  }, []);

  const addTable = async () => {
    if (!newTable) return;

    const { error } = await supabase.from('tables').insert({
      name: newTable,
    });

    if (error) {
      toast.error('Failed to add table');
    } else {
      toast.success('Table added');
      setNewTable('');
      fetchTables();
    }
  };

  const deleteTable = async (id: string) => {
    const { error } = await supabase
      .from('tables')
      .delete()
      .eq('id', id);

    if (!error) {
      toast.success('Table deleted');
      fetchTables();
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Manage Tables</h1>

      {/* Add Table */}
      <div className="flex gap-2">
        <Input
          placeholder="Table name (e.g. Table 1)"
          value={newTable}
          onChange={(e) => setNewTable(e.target.value)}
        />
        <Button onClick={addTable}>Add</Button>
      </div>

      {/* Table List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tables.map((table) => (
          <div
            key={table.id}
            className="bg-card p-4 rounded-xl shadow flex flex-col items-center gap-3"
          >
            <span className="font-semibold text-lg">{table.name}</span>

            {/* QR Code */}
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${window.location.origin}/menu?table=${table.id}`}
              alt="QR Code"
              className="rounded-lg border"
            />

            <Button
              variant="destructive"
              size="sm"
              onClick={() => deleteTable(table.id)}
            >
              Delete
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminTables;
