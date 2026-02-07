import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import FeaturedDishes from '@/components/FeaturedDishes';
import MapSection from '@/components/MapSection';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <>
      <Helmet>
        <title>Kanak Snacks - Pure Veg Restaurant in Bhiwandi | Best Burgers, Fries & Momos</title>
        <meta 
          name="description" 
          content="Kanak Snacks is the best pure vegetarian restaurant in Bhiwandi serving delicious burgers, fries, momos, and Chinese food. Open 8 AM to 11 PM daily." 
        />
        <meta 
          name="keywords" 
          content="Kanak Snacks, Pure Veg Restaurant in Bhiwandi, Burgers in Bhiwandi, Fries and Momos in Bhiwandi, Chinese Food Bhiwandi, Vegetarian Street Food" 
        />
        <meta property="og:title" content="Kanak Snacks - Pure Veg Restaurant in Bhiwandi" />
        <meta property="og:description" content="Fresh. Pure Veg. Street Food Love. Best vegetarian snacks in Bhiwandi." />
        <meta property="og:type" content="restaurant" />
        <link rel="canonical" href="https://kanaksnacks.com" />
      </Helmet>

      <Navbar />
      
      <main>
        <HeroSection />
        <FeaturedDishes />
        <MapSection />
      </main>
      
      <Footer />
    </>
  );
};

export default Index;
