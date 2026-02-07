import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, ImageIcon } from 'lucide-react';

interface GalleryImage {
  id: string;
  image_url: string;
  title: string | null;
  description: string | null;
  display_order: number;
}

const AdminGallery = () => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingImage, setEditingImage] = useState<GalleryImage | null>(null);
  const [formData, setFormData] = useState({
    image_url: '',
    title: '',
    description: '',
  });
  const [uploading, setUploading] = useState(false);

  const fetchImages = async () => {
    const { data, error } = await supabase
      .from('gallery')
      .select('*')
      .order('display_order', { ascending: true });

    if (!error && data) setImages(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const resetForm = () => {
    setFormData({ image_url: '', title: '', description: '' });
    setEditingImage(null);
  };

  const openEditDialog = (image: GalleryImage) => {
    setEditingImage(image);
    setFormData({
      image_url: image.image_url,
      title: image.title || '',
      description: image.description || '',
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
      .upload(`gallery/${fileName}`, file);

    if (uploadError) {
      toast.error('Failed to upload image');
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from('restaurant-images')
      .getPublicUrl(`gallery/${fileName}`);

    setFormData((prev) => ({ ...prev, image_url: urlData.publicUrl }));
    setUploading(false);
    toast.success('Image uploaded');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.image_url) {
      toast.error('Please upload an image');
      return;
    }

    const imageData = {
      image_url: formData.image_url,
      title: formData.title || null,
      description: formData.description || null,
    };

    if (editingImage) {
      const { error } = await supabase
        .from('gallery')
        .update(imageData)
        .eq('id', editingImage.id);

      if (error) {
        toast.error('Failed to update image');
        return;
      }
      toast.success('Image updated');
    } else {
      const { error } = await supabase.from('gallery').insert(imageData);

      if (error) {
        toast.error('Failed to add image');
        return;
      }
      toast.success('Image added');
    }

    setIsDialogOpen(false);
    resetForm();
    fetchImages();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return;

    const { error } = await supabase.from('gallery').delete().eq('id', id);

    if (error) {
      toast.error('Failed to delete image');
      return;
    }

    toast.success('Image deleted');
    fetchImages();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">
            Manage Gallery
          </h1>
          <p className="text-muted-foreground mt-1">
            Add photos of your restaurant, food, and team
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-accent rounded-xl">
              <Plus className="w-4 h-4 mr-2" />
              Add Photo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingImage ? 'Edit Photo' : 'Add New Photo'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Image *</label>
                <div className="mt-1 space-y-2">
                  {formData.image_url && (
                    <img
                      src={formData.image_url}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-xl"
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
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
                  placeholder="Photo title"
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
              <Button
                type="submit"
                className="w-full bg-primary text-primary-foreground hover:bg-accent rounded-xl"
                disabled={uploading}
              >
                {editingImage ? 'Update Photo' : 'Add Photo'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="aspect-square bg-card rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : images.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-2xl">
          <p className="text-4xl mb-4">📷</p>
          <h3 className="text-xl font-semibold mb-2">No photos yet</h3>
          <p className="text-muted-foreground">Add your first photo to the gallery</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image) => (
            <div key={image.id} className="relative group aspect-square rounded-2xl overflow-hidden shadow-card">
              {image.image_url ? (
                <img
                  src={image.image_url}
                  alt={image.title || 'Gallery'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-muted-foreground" />
                </div>
              )}
              <div className="absolute inset-0 bg-charcoal/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  className="rounded-xl"
                  onClick={() => openEditDialog(image)}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  className="rounded-xl"
                  onClick={() => handleDelete(image.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              {image.title && (
                <div className="absolute bottom-0 left-0 right-0 bg-charcoal/70 p-2">
                  <p className="text-cream text-sm truncate">{image.title}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminGallery;
