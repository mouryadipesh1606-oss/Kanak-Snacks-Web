import { MapPin, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';

const MapSection = () => {
  return (
    <section className="section-padding bg-secondary">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
            Find <span className="text-primary">Us</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Visit our restaurant in Bhiwandi for the best vegetarian street food experience
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Map */}
          <div className="rounded-2xl overflow-hidden shadow-card h-[400px]">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3765.8877741147516!2d73.0487!3d19.3087!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7bd8c4c5a6a3d%3A0x5f5a8d7c4c5a6a3d!2sKanak%20Snacks!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Kanak Snacks Location"
            />
          </div>

          {/* Info */}
          <div className="space-y-6">
            <div className="bg-card rounded-2xl p-6 shadow-card">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Our Address</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    College Road, Dhamankar Naka,<br />
                    Kamatghar, Bhiwandi,<br />
                    Maharashtra 421305
                  </p>
                </div>
              </div>
            </div>

            <a 
              href="https://maps.app.goo.gl/xH8AqExAtDj8dq6Z6" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <Button className="w-full bg-primary text-primary-foreground hover:bg-accent rounded-xl py-6 text-lg">
                <Navigation className="w-5 h-5 mr-2" />
                Get Directions
              </Button>
            </a>

            <div className="bg-primary/10 rounded-2xl p-6 border border-primary/20">
              <h4 className="font-semibold text-primary mb-2">💡 Pro Tip</h4>
              <p className="text-sm text-muted-foreground">
                We're located near Dhamankar Naka on College Road. Look for the yellow signboard!
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MapSection;
