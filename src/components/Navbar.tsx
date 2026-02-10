import { useState, useEffect } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { Menu, X, Phone, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CartDrawer from '@/components/CartDrawer';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [cart, setCart] = useState<any>({});
  const [isCartOpen, setIsCartOpen] = useState(false);
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const tableId = searchParams.get('table');
  const isTableMode = !!tableId;

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Menu', path: '/menu' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'Contact', path: '/contact' },
    { name: 'Admin', path: '/admin' },
  ];

  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    const loadCart = () => {
      const stored = JSON.parse(localStorage.getItem('cart') || '{}');
      setCart(stored);
    };

    loadCart();
    window.addEventListener('storage', loadCart);
    return () => window.removeEventListener('storage', loadCart);
  }, []);

  const cartCount = Object.values(cart).reduce(
    (sum: number, item: any) => sum + item.quantity,
    0
  );

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-charcoal border-b">
        <div className="container mx-auto px-4 flex justify-between h-16 items-center">
          <Link to="/" className="text-primary font-bold text-2xl">
            Kanak Snacks
          </Link>

          <div className="hidden md:flex gap-6 items-center">
            {navLinks.map((link) => (
              <Link key={link.path} to={link.path}>
                {link.name}
              </Link>
            ))}

            {isTableMode && (
              <button onClick={() => setIsCartOpen(true)} className="relative">
                <ShoppingCart />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 text-xs bg-primary text-white rounded-full px-1">
                    {cartCount}
                  </span>
                )}
              </button>
            )}
          </div>

          <button
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X /> : <Menu />}
          </button>
        </div>
      </nav>

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        setCart={setCart}
      />
    </>
  );
};

export default Navbar;
