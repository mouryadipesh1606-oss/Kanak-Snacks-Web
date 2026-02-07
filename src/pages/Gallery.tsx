import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface GalleryImage {
  id: string;
  image_url: string;
  title: string | null;
  description: string | null;
}

const Gallery = () => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

  useEffect(() => {
    const fetchImages = async () => {
      const { data, error } = await supabase
        .from('gallery')
        .select('*')
        .order('display_order', { ascending: true });

      if (!error && data) {
        setImages(data);
      }
      setLoading(false);
    };

    fetchImages();
  }, []);

  const openLightbox = (image: GalleryImage) => {
    setSelectedImage(image);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setSelectedImage(null);
    document.body.style.overflow = 'auto';
  };

  return (
    <>
      <Helmet>
        <title>Gallery - Kanak Snacks | Photos of Our Restaurant & Food</title>
        <meta
          name="description"
          content="View photos of Kanak Snacks restaurant, our delicious vegetarian dishes, cozy interior, and friendly staff. See what makes us special!"
        />
      </Helmet>

      <Navbar />

      <main className="pt-20">
        {/* Hero */}
        <section className="bg-charcoal py-16 md:py-24">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-cream mb-4">
              Our <span className="text-primary">Gallery</span>
            </h1>
            <p className="text-cream/70 max-w-2xl mx-auto">
              Take a visual tour of our restaurant, delicious food, and the moments we cherish
            </p>
          </div>
        </section>

        {/* Gallery Grid */}
        <section className="section-padding bg-secondary">
          <div className="container mx-auto">
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div
                    key={i}
                    className="aspect-square bg-card rounded-2xl animate-pulse"
                  />
                ))}
              </div>
            ) : images.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-4xl mb-4">📷</p>
                <h3 className="text-xl font-semibold mb-2">Gallery coming soon!</h3>
                <p className="text-muted-foreground">
                  We're preparing beautiful photos of our restaurant and food
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {images.map((image, index) => (
                  <div
                    key={image.id}
                    className={`relative group cursor-pointer overflow-hidden rounded-2xl shadow-card hover:shadow-lg transition-all duration-300 ${
                      index === 0 ? 'md:col-span-2 md:row-span-2' : ''
                    }`}
                    onClick={() => openLightbox(image)}
                  >
                    <div className={`${index === 0 ? 'aspect-square' : 'aspect-square'}`}>
                      <img
                        src={image.image_url}
                        alt={image.title || 'Gallery image'}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        {image.title && (
                          <h3 className="text-cream font-semibold text-sm md:text-base">
                            {image.title}
                          </h3>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-charcoal/95 flex items-center justify-center p-4 animate-fade-in"
          onClick={closeLightbox}
        >
          <button
            className="absolute top-4 right-4 text-cream hover:text-primary transition-colors z-10"
            onClick={closeLightbox}
            aria-label="Close lightbox"
          >
            <X className="w-8 h-8" />
          </button>
          <div
            className="max-w-5xl max-h-[90vh] relative animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedImage.image_url}
              alt={selectedImage.title || 'Gallery image'}
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
            />
            {(selectedImage.title || selectedImage.description) && (
              <div className="absolute bottom-0 left-0 right-0 bg-charcoal/80 p-4 rounded-b-lg">
                {selectedImage.title && (
                  <h3 className="text-cream font-semibold text-lg">
                    {selectedImage.title}
                  </h3>
                )}
                {selectedImage.description && (
                  <p className="text-cream/70 text-sm mt-1">
                    {selectedImage.description}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <Footer />
    </>
  );
};

export default Gallery;
