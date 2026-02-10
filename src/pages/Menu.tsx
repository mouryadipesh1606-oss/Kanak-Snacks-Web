import { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Search, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import DishCard from '@/components/DishCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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

type SortOption = 'default' | 'price-low' | 'price-high' | 'name';

const Menu = () => {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [cart, setCart] = useState<Record<string, { dish: Dish; quantity: number }>>({});

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

  const filteredAndSortedDishes = useMemo(() => {
    let result = [...dishes];

    // Search
    if (searchQuery) {
      result = result.filter(
        (dish) =>
          dish.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          dish.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category
    if (selectedCategory !== 'all') {
      result = result.filter((dish) => dish.category_id === selectedCategory);
    }

    // Sort
    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break;
    }

    return result;
  }, [dishes, searchQuery, selectedCategory, sortBy]);

  const getCategoryName = (categoryId: string | null) => {
    if (!categoryId) return 'Uncategorized';
    const category = categories.find((c) => c.id === categoryId);
    return category?.name || 'Uncategorized';
  };

  // Add to cart
 const handleAddToCart = (dish: Dish) => {
  setCart((prev) => {
    const updated = { ...prev };

    if (updated[dish.id]) {
      updated[dish.id].quantity += 1;
    } else {
      updated[dish.id] = { dish, quantity: 1 };
    }

    // save to localStorage
    localStorage.setItem('cart', JSON.stringify(updated));

    return updated;
  });
};


  // Group dishes
  const groupedDishes = useMemo(() => {
    if (selectedCategory !== 'all') {
      return { [selectedCategory]: filteredAndSortedDishes };
    }

    const groups: Record<string, Dish[]> = {};
    categories.forEach((cat) => {
      const catDishes = filteredAndSortedDishes.filter((d) => d.category_id === cat.id);
      if (catDishes.length > 0) {
        groups[cat.id] = catDishes;
      }
    });

    const uncategorized = filteredAndSortedDishes.filter((d) => !d.category_id);
    if (uncategorized.length > 0) {
      groups['uncategorized'] = uncategorized;
    }

    return groups;
  }, [filteredAndSortedDishes, categories, selectedCategory]);

  return (
    <>
      <Helmet>
        <title>Menu - Kanak Snacks</title>
      </Helmet>

      <Navbar />

      <main className="pt-20">
        {/* Hero */}
        <section className="bg-charcoal py-16 md:py-24">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-cream mb-4">
              Our <span className="text-primary">Menu</span>
            </h1>
            <p className="text-cream/70 max-w-2xl mx-auto">
              Explore our carefully crafted pure vegetarian dishes
            </p>
          </div>
        </section>

        {/* Filters */}
        <section className="sticky top-16 md:top-20 z-40 bg-background/95 backdrop-blur-md border-b py-4">
          <div className="container mx-auto px-4 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search dishes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 rounded-xl"
              />
            </div>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[180px] rounded-xl">
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </section>

        {/* Menu Items */}
        <section className="section-padding bg-secondary">
          <div className="container mx-auto">
            {loading ? (
              <div>Loading...</div>
            ) : (
              <div className="space-y-12">
                {Object.entries(groupedDishes).map(([categoryId, categoryDishes]) => (
                  <div key={categoryId}>
                    <h2 className="text-2xl font-bold mb-6">
                      {categoryId === 'uncategorized'
                        ? 'Other Items'
                        : getCategoryName(categoryId)}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {categoryDishes.map((dish) => (
                        <DishCard
                          key={dish.id}
                          dish={dish}
                          onAddToCart={handleAddToCart}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default Menu;
