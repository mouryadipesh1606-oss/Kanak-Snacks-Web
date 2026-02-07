import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Phone, MessageCircle, MapPin, Clock, Send, CheckCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const contactSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100, 'Name is too long'),
  email: z.string().trim().email('Invalid email address').max(255, 'Email is too long'),
  phone: z.string().trim().max(20, 'Phone number is too long').optional(),
  message: z.string().trim().min(10, 'Message must be at least 10 characters').max(1000, 'Message is too long'),
});

type ContactFormData = z.infer<typeof contactSchema>;

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      message: '',
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);

    try {
      const { error } = await supabase.from('contact_submissions').insert({
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        message: data.message,
      });

      if (error) throw error;

      setIsSubmitted(true);
      form.reset();
      toast.success('Message sent successfully!');
    } catch (error) {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Contact Us - Kanak Snacks | Get in Touch</title>
        <meta
          name="description"
          content="Contact Kanak Snacks for orders, inquiries, or feedback. Call us at 092267 60904 or visit us at College Road, Bhiwandi."
        />
      </Helmet>

      <Navbar />

      <main className="pt-20">
        {/* Hero */}
        <section className="bg-charcoal py-16 md:py-24">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-cream mb-4">
              Contact <span className="text-primary">Us</span>
            </h1>
            <p className="text-cream/70 max-w-2xl mx-auto">
              Have a question or want to place an order? We'd love to hear from you!
            </p>
          </div>
        </section>

        {/* Contact Content */}
        <section className="section-padding bg-secondary">
          <div className="container mx-auto">
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Contact Info */}
              <div className="space-y-6">
                <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-6">
                  Get in <span className="text-primary">Touch</span>
                </h2>

                {/* Info Cards */}
                <div className="space-y-4">
                  <a
                    href="tel:09226760904"
                    className="flex items-center gap-4 bg-card rounded-2xl p-5 shadow-card hover:shadow-lg transition-all duration-300 group"
                  >
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Phone className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-muted-foreground text-sm">Call Us</p>
                      <p className="text-foreground font-semibold text-lg">092267 60904</p>
                    </div>
                  </a>

                  <a
                    href="https://wa.me/919226760904"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 bg-card rounded-2xl p-5 shadow-card hover:shadow-lg transition-all duration-300 group"
                  >
                    <div className="w-14 h-14 rounded-full bg-green-500/10 flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
                      <MessageCircle className="w-6 h-6 text-green-500" />
                    </div>
                    <div>
                      <p className="text-muted-foreground text-sm">WhatsApp</p>
                      <p className="text-foreground font-semibold text-lg">Message Us</p>
                    </div>
                  </a>

                  <div className="flex items-start gap-4 bg-card rounded-2xl p-5 shadow-card">
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-muted-foreground text-sm">Our Location</p>
                      <p className="text-foreground font-semibold">
                        College Road, Dhamankar Naka,
                        <br />
                        Kamatghar, Bhiwandi,
                        <br />
                        Maharashtra 421305
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 bg-card rounded-2xl p-5 shadow-card">
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                      <Clock className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-muted-foreground text-sm">Opening Hours</p>
                      <p className="text-foreground font-semibold">8:00 AM – 11:00 PM (All Days)</p>
                    </div>
                  </div>
                </div>

                {/* Map */}
                <div className="rounded-2xl overflow-hidden shadow-card h-[250px]">
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
              </div>

              {/* Contact Form */}
              <div className="bg-card rounded-2xl p-6 md:p-8 shadow-card">
                <h2 className="text-2xl font-display font-bold text-foreground mb-6">
                  Send us a <span className="text-primary">Message</span>
                </h2>

                {isSubmitted ? (
                  <div className="text-center py-12 space-y-4">
                    <div className="w-16 h-16 mx-auto bg-accent/10 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-8 h-8 text-accent" />
                    </div>
                    <h3 className="text-xl font-semibold">Thank You!</h3>
                    <p className="text-muted-foreground">
                      Your message has been sent. We'll get back to you soon!
                    </p>
                    <Button
                      variant="outline"
                      className="rounded-xl"
                      onClick={() => setIsSubmitted(false)}
                    >
                      Send Another Message
                    </Button>
                  </div>
                ) : (
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Your Name *</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter your name"
                                className="rounded-xl"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address *</FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="Enter your email"
                                className="rounded-xl"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input
                                type="tel"
                                placeholder="Enter your phone number"
                                className="rounded-xl"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="message"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Message *</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Write your message here..."
                                className="rounded-xl min-h-[120px] resize-none"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="submit"
                        className="w-full bg-primary text-primary-foreground hover:bg-accent rounded-xl py-6 text-lg"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          'Sending...'
                        ) : (
                          <>
                            <Send className="w-5 h-5 mr-2" />
                            Send Message
                          </>
                        )}
                      </Button>
                    </form>
                  </Form>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default Contact;
