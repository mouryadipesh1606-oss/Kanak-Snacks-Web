import { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Search, SlidersHorizontal } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useSearchParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import DishCard from '@/components/DishCard';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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
}

const Menu = () => {
  const [searchParams] = useSearchParams();
  const tableId = searchParams.get('table');
  const isTableMode = !!tableId;

  const [dishes, setDishes] = useState<Dish[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [cart, setCart] = useState<Record<string, { dish: Dish; quantity: number }>>({});

  // Load cart
  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem('cart') || '{}');
    setCart(storedCart);
  }, []);

  // Save cart
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      const [dishesRes, categoriesRes] = await Promise.all([
        supabase.from('dishes').select('*').order('display_order', { ascending: true }),
        supabase.from('categories').select('*').order('display_order', { ascending: true }),
      ]);

      if (dishesRes.data) setDishes(dishesRes.data);
      if (categoriesRes.data) setCategories(categoriesRes.data);
      setLoading(false);
    };

    fetchData();
  }, []);

  // Add to cart
  const handleAddToCart = (dish: Dish) => {
    setCart((prev) => {
      const updated = { ...prev };
      if (updated[dish.id]) {
        updated[dish.id].quantity += 1;
      } else {
        updated[dish.id] = { dish, quantity: 1 };
      }
      return updated;
    });
  };

  // Filter
  const filteredDishes = useMemo(() => {
    let result = [...dishes];

    if (searchQuery) {
      result = result.filter((dish) =>
        dish.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      result = result.filter((dish) => dish.category_id === selectedCategory);
    }

    return result;
  }, [dishes, searchQuery, selectedCategory]);

  // Group
  const groupedDishes = useMemo(() => {
    const groups: Record<string, Dish[]> = {};
    categories.forEach((cat) => {
      const catDishes = filteredDishes.filter((d) => d.category_id === cat.id);
      if (catDishes.length > 0) groups[cat.id] = catDishes;
    });
    return groups;
  }, [filteredDishes, categories]);

  const getCategoryName = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    return category?.name || 'Items';
  };

  return (
    <>
      <Helmet>
        <title>Menu - Kanak Snacks</title>
      </Helmet>

      <Navbar />

      <main className="pt-20">
        {/* Hero */}
        <section className="bg-charcoal py-16 text-center">
          <h1 className="text-4xl font-bold text-cream">
            Our <span className="text-primary">Menu</span>
          </h1>
        </section>

        {/* Filters */}
        <section className="bg-background border-b py-4">
          <div className="container mx-auto flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" />
              <Input
                placeholder="Search dishes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[180px]">
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </section>

        {/* Menu */}
        <section className="py-10">
          <div className="container mx-auto space-y-10">
            {loading ? (
              <div>Loading...</div>
            ) : (
              Object.entries(groupedDishes).map(([categoryId, dishes]) => (
                <div key={categoryId}>
                  <h2 className="text-2xl font-bold mb-6">
                    {getCategoryName(categoryId)}
                  </h2>

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {dishes.map((dish) => (
                      <DishCard
                        key={dish.id}
                        dish={dish}
                        onAddToCart={handleAddToCart}
                        isTableMode={isTableMode}
                      />
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default Menu;
