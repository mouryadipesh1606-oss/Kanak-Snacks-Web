import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import DishCard from './DishCard';

interface Dish {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  category_id: string | null;
  is_available: boolean;
}

const FeaturedDishes = () => {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDishes = async () => {
      const { data, error } = await supabase
        .from('dishes')
        .select('*')
        .eq('is_available', true)
        .order('display_order', { ascending: true })
        .limit(6);

      if (!error && data) {
        setDishes(data);
      }
      setLoading(false);
    };

    fetchDishes();
  }, []);

  if (loading) {
    return (
      <section className="section-padding bg-background">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
              Our <span className="text-primary">Popular</span> Dishes
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-card rounded-2xl h-80 animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section-padding bg-background">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full mb-4">
            Our Specialties
          </span>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
            Popular <span className="text-primary">Dishes</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover our most loved vegetarian delights, made fresh with love and authentic spices
          </p>
        </div>

        {dishes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dishes.map((dish, index) => (
              <div key={dish.id} className={`animate-slide-up delay-${(index + 1) * 100}`}>
                <DishCard dish={dish} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Our menu is being prepared. Check back soon!</p>
          </div>
        )}

        <div className="text-center mt-12">
          <Link to="/menu">
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-accent rounded-full px-8">
              View Full Menu
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedDishes;
