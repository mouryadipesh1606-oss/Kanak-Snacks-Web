import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, ImageIcon } from 'lucide-react';

interface Category {
  id: string;
  name: string;
}

interface Dish {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  category_id: string | null;
  is_available: boolean;
  display_order: number;
}

const AdminDishes = () => {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDish, setEditingDish] = useState<Dish | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image_url: '',
    category_id: '',
    is_available: true,
  });
  const [uploading, setUploading] = useState(false);

  const fetchData = async () => {
    const [dishesRes, categoriesRes] = await Promise.all([
      supabase.from('dishes').select('*').order('display_order', { ascending: true }),
      supabase.from('categories').select('*').order('display_order', { ascending: true }),
    ]);

    if (dishesRes.data) setDishes(dishesRes.data);
    if (categoriesRes.data) setCategories(categoriesRes.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      image_url: '',
      category_id: '',
      is_available: true,
    });
    setEditingDish(null);
  };

  const openEditDialog = (dish: Dish) => {
    setEditingDish(dish);
    setFormData({
      name: dish.name,
      description: dish.description || '',
      price: dish.price.toString(),
      image_url: dish.image_url || '',
      category_id: dish.category_id || '',
      is_available: dish.is_available,
    });
    setIsDialogOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('restaurant-images')
      .upload(`dishes/${fileName}`, file);

    if (uploadError) {
      toast.error('Failed to upload image');
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from('restaurant-images')
      .getPublicUrl(`dishes/${fileName}`);

    setFormData((prev) => ({ ...prev, image_url: urlData.publicUrl }));
    setUploading(false);
    toast.success('Image uploaded');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const dishData = {
      name: formData.name,
      description: formData.description || null,
      price: parseFloat(formData.price),
      image_url: formData.image_url || null,
      category_id: formData.category_id || null,
      is_available: formData.is_available,
    };

    if (editingDish) {
      const { error } = await supabase
        .from('dishes')
        .update(dishData)
        .eq('id', editingDish.id);

      if (error) {
        toast.error('Failed to update dish');
        return;
      }
      toast.success('Dish updated');
    } else {
      const { error } = await supabase.from('dishes').insert(dishData);

      if (error) {
        toast.error('Failed to add dish');
        return;
      }
      toast.success('Dish added');
    }

    setIsDialogOpen(false);
    resetForm();
    fetchData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this dish?')) return;

    const { error } = await supabase.from('dishes').delete().eq('id', id);

    if (error) {
      toast.error('Failed to delete dish');
      return;
    }

    toast.success('Dish deleted');
    fetchData();
  };

  const getCategoryName = (categoryId: string | null) => {
    if (!categoryId) return 'Uncategorized';
    return categories.find((c) => c.id === categoryId)?.name || 'Uncategorized';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">
            Manage Dishes
          </h1>
          <p className="text-muted-foreground mt-1">
            Add, edit, or remove dishes from your menu
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-accent rounded-xl">
              <Plus className="w-4 h-4 mr-2" />
              Add Dish
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingDish ? 'Edit Dish' : 'Add New Dish'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Name *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Dish name"
                  required
                  className="rounded-xl mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Short description"
                  className="rounded-xl mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Price (₹) *</label>
                <Input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData((p) => ({ ...p, price: e.target.value }))}
                  placeholder="0.00"
                  required
                  min="0"
                  step="0.01"
                  className="rounded-xl mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Category</label>
                <Select
                  value={formData.category_id}
                  onValueChange={(v) => setFormData((p) => ({ ...p, category_id: v }))}
                >
                  <SelectTrigger className="rounded-xl mt-1">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Image</label>
                <div className="mt-1 space-y-2">
                  {formData.image_url && (
                    <img
                      src={formData.image_url}
                      alt="Preview"
                      className="w-full h-32 object-cover rounded-xl"
                    />
                  )}
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="rounded-xl"
                  />
                  {uploading && <p className="text-sm text-muted-foreground">Uploading...</p>}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Available</label>
                <Switch
                  checked={formData.is_available}
                  onCheckedChange={(checked) => setFormData((p) => ({ ...p, is_available: checked }))}
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-primary text-primary-foreground hover:bg-accent rounded-xl"
              >
                {editingDish ? 'Update Dish' : 'Add Dish'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-card rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : dishes.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-2xl">
          <p className="text-4xl mb-4">🍽️</p>
          <h3 className="text-xl font-semibold mb-2">No dishes yet</h3>
          <p className="text-muted-foreground">Add your first dish to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {dishes.map((dish) => (
            <div key={dish.id} className="bg-card rounded-2xl overflow-hidden shadow-card">
              <div className="h-32 relative">
                {dish.image_url ? (
                  <img
                    src={dish.image_url}
                    alt={dish.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-muted-foreground" />
                  </div>
                )}
                {!dish.is_available && (
                  <div className="absolute top-2 left-2 bg-destructive text-destructive-foreground text-xs px-2 py-1 rounded-full">
                    Unavailable
                  </div>
                )}
                <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-sm px-2 py-1 rounded-full font-semibold">
                  ₹{dish.price}
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-foreground">{dish.name}</h3>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {dish.description || 'No description'}
                </p>
                <p className="text-xs text-primary mt-2">
                  {getCategoryName(dish.category_id)}
                </p>
                <div className="flex gap-2 mt-4">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 rounded-xl"
                    onClick={() => openEditDialog(dish)}
                  >
                    <Pencil className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="rounded-xl"
                    onClick={() => handleDelete(dish.id)}
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

export default AdminDishes;
