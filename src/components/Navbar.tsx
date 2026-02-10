import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Phone, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CartDrawer from '@/components/CartDrawer';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [cart, setCart] = useState<any>({});
  const [isCartOpen, setIsCartOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Menu', path: '/menu' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'Contact', path: '/contact' },
    { name: 'Admin', path: '/admin' },
  ];

  const isActive = (path: string) => location.pathname === path;

  // Load cart from localStorage
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
      <nav className="fixed top-0 left-0 right-0 z-50 bg-charcoal/95 backdrop-blur-md border-b border-primary/20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <span className="text-2xl md:text-3xl font-display font-bold text-primary">
                Kanak
              </span>
              <span className="text-lg md:text-xl font-light text-cream">
                Snacks
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-sm font-medium transition-colors duration-300 ${
                    isActive(link.path)
                      ? 'text-primary'
                      : 'text-cream/80 hover:text-primary'
                  }`}
                >
                  {link.name}
                </Link>
              ))}

              {/* Cart Icon */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative text-cream hover:text-primary transition"
              >
                <ShoppingCart className="w-6 h-6" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full px-1">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* Call Button */}
              <a href="tel:09226760904">
                <Button
                  size="sm"
                  className="bg-primary text-charcoal hover:bg-accent rounded-full px-6"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Call Now
                </Button>
              </a>
            </div>

            {/* Mobile Right Icons */}
            <div className="md:hidden flex items-center gap-3">
              {/* Cart Icon */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative text-cream"
              >
                <ShoppingCart className="w-6 h-6" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full px-1">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* Menu Toggle */}
              <button
                className="text-cream p-2"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Toggle menu"
              >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Nav */}
          {isOpen && (
            <div className="md:hidden bg-charcoal absolute top-16 left-0 right-0 border-b border-primary/20 animate-fade-in shadow-lg">
              <div className="flex flex-col py-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsOpen(false)}
                    className={`px-4 py-3 text-base font-medium transition-colors ${
                      isActive(link.path)
                        ? 'text-primary bg-primary/10'
                        : 'text-cream/80 hover:text-primary hover:bg-primary/5'
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
                <div className="px-4 pt-4">
                  <a href="tel:09226760904" className="block">
                    <Button className="w-full bg-primary text-charcoal hover:bg-accent rounded-full">
                      <Phone className="w-4 h-4 mr-2" />
                      Call Now
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Cart Drawer */}
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
