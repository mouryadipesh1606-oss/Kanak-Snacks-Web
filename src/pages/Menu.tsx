import { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Search, SlidersHorizontal, ArrowUpDown, ShoppingCart } from 'lucide-react';
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
  const [isCartOpen, setIsCartOpen] = useState(false);

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

    if (searchQuery) {
      result = result.filter(
        (dish) =>
          dish.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          dish.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      result = result.filter((dish) => dish.category_id === selectedCategory);
    }

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

      return updated;
    });

    setIsCartOpen(true);
  };

  const cartItems = Object.values(cart);

  const cartTotal = cartItems.reduce(
    (sum, item) => sum + item.dish.price * item.quantity,
    0
  );

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

      {/* Cart button in header */}
      <div className="fixed top-20 right-4 z-40">
        <Button
          className="rounded-full"
          onClick={() => setIsCartOpen(true)}
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          {cartItems.length}
        </Button>
      </div>

      <main className="pt-20">
        {/* Menu Section */}
        <section className="section-padding bg-secondary">
          <div className="container mx-auto">
            {loading ? (
              <p>Loading...</p>
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

        {/* Cart Drawer */}
        {isCartOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
            <div className="w-full max-w-md bg-white h-full shadow-xl p-6 overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Your Cart</h2>
                <button onClick={() => setIsCartOpen(false)}>✕</button>
              </div>

              {cartItems.length === 0 ? (
                <p>Cart is empty</p>
              ) : (
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div
                      key={item.dish.id}
                      className="flex justify-between items-center border-b pb-3"
                    >
                      <div>
                        <p className="font-semibold">{item.dish.name}</p>
                        <p className="text-sm">
                          ₹{item.dish.price} × {item.quantity}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() =>
                            setCart((prev) => {
                              const updated = { ...prev };
                              updated[item.dish.id].quantity -= 1;
                              if (updated[item.dish.id].quantity <= 0) {
                                delete updated[item.dish.id];
                              }
                              return updated;
                            })
                          }
                        >
                          -
                        </Button>
                        <span>{item.quantity}</span>
                        <Button
                          size="icon"
                          onClick={() =>
                            setCart((prev) => {
                              const updated = { ...prev };
                              updated[item.dish.id].quantity += 1;
                              return updated;
                            })
                          }
                        >
                          +
                        </Button>
                      </div>
                    </div>
                  ))}

                  <div className="pt-4 border-t">
                    <p className="text-lg font-bold">Total: ₹{cartTotal}</p>
                    <Button className="w-full mt-3">
                      Place Order
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </>
  );
};

export default Menu;
