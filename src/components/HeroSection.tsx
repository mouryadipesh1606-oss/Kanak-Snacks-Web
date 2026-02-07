import { Link } from 'react-router-dom';
import { Phone, MessageCircle, Clock, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import heroBg from '@/assets/hero-bg.jpg';

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBg})` }}
      />
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-charcoal/80 via-charcoal/50 to-charcoal/90" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-24 md:py-32 text-center">
        <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/20 border border-primary/30 rounded-full animate-fade-in">
            <span className="text-primary text-sm font-medium">🌿 100% Pure Vegetarian</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-cream leading-tight animate-slide-up">
            <span className="text-primary">Kanak</span> Snacks
            <span className="block text-2xl md:text-3xl lg:text-4xl font-normal text-cream/90 mt-2">
              Pure Veg
            </span>
          </h1>

          {/* Tagline */}
          <p className="text-xl md:text-2xl text-cream/80 font-light animate-slide-up delay-100">
            Fresh. Pure Veg. Street Food Love.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 animate-slide-up delay-200">
            <Link to="/menu">
              <Button size="lg" className="btn-hero-primary min-w-[200px]">
                View Menu
              </Button>
            </Link>
            <a href="https://wa.me/919226760904" target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="btn-hero min-w-[200px] bg-white text-charcoal hover:bg-primary hover:text-charcoal border-2 border-white">
                <MessageCircle className="w-5 h-5 mr-2" />
                Order on WhatsApp
              </Button>
            </a>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-12 animate-slide-up delay-300">
            {/* Hours */}
            <div className="glass-card p-4 md:p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <div className="text-left">
                <p className="text-cream/60 text-xs uppercase tracking-wider">Open Daily</p>
                <p className="text-cream font-semibold">8 AM – 11 PM</p>
              </div>
            </div>

            {/* Phone */}
            <a href="tel:09226760904" className="glass-card p-4 md:p-6 flex items-center gap-4 hover:bg-primary/10 transition-colors">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <Phone className="w-6 h-6 text-primary" />
              </div>
              <div className="text-left">
                <p className="text-cream/60 text-xs uppercase tracking-wider">Call Us</p>
                <p className="text-cream font-semibold">092267 60904</p>
              </div>
            </a>

            {/* Location */}
            <a 
              href="https://maps.app.goo.gl/xH8AqExAtDj8dq6Z6" 
              target="_blank" 
              rel="noopener noreferrer"
              className="glass-card p-4 md:p-6 flex items-center gap-4 hover:bg-primary/10 transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <MapPin className="w-6 h-6 text-primary" />
              </div>
              <div className="text-left">
                <p className="text-cream/60 text-xs uppercase tracking-wider">Find Us</p>
                <p className="text-cream font-semibold">Bhiwandi</p>
              </div>
            </a>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-cream/30 rounded-full flex items-start justify-center p-2">
          <div className="w-1 h-2 bg-primary rounded-full animate-pulse" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
