import { Link } from 'react-router-dom';
import { Phone, MapPin, Clock, MessageCircle } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-charcoal text-cream">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-3xl font-display font-bold text-primary">
                Kanak
              </span>
              <span className="text-xl font-light">Snacks</span>
            </Link>
            <p className="text-cream/70 text-sm leading-relaxed">
              Fresh. Pure Veg. Street Food Love. Serving the best vegetarian snacks in Bhiwandi since passion met flavor.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-primary">Quick Links</h4>
            <div className="flex flex-col gap-2">
              <Link to="/" className="text-cream/70 hover:text-primary transition-colors text-sm">
                Home
              </Link>
              <Link to="/menu" className="text-cream/70 hover:text-primary transition-colors text-sm">
                Our Menu
              </Link>
              <Link to="/gallery" className="text-cream/70 hover:text-primary transition-colors text-sm">
                Gallery
              </Link>
              <Link to="/contact" className="text-cream/70 hover:text-primary transition-colors text-sm">
                Contact Us
              </Link>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-primary">Contact Info</h4>
            <div className="space-y-3">
              <a href="tel:09226760904" className="flex items-start gap-3 text-cream/70 hover:text-primary transition-colors text-sm">
                <Phone className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>092267 60904</span>
              </a>
              <a 
                href="https://wa.me/919226760904" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-start gap-3 text-cream/70 hover:text-primary transition-colors text-sm"
              >
                <MessageCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>WhatsApp Us</span>
              </a>
              <div className="flex items-start gap-3 text-cream/70 text-sm">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>College Road, Dhamankar Naka, Kamatghar, Bhiwandi, Maharashtra 421305</span>
              </div>
            </div>
          </div>

          {/* Opening Hours */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-primary">Opening Hours</h4>
            <div className="flex items-start gap-3 text-cream/70 text-sm">
              <Clock className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-cream">All Days</p>
                <p>8:00 AM – 11:00 PM</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-cream/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-cream/50 text-sm">
            © {new Date().getFullYear()} Kanak Snacks. All rights reserved.
          </p>
          <p className="text-cream/50 text-sm">
            🌿 100% Pure Vegetarian
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
