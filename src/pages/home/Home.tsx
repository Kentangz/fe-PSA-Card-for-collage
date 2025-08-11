import AboutSection from '../../components/landing-page/AboutSection';
import HeroSection from '../../components/landing-page/HeroSection';
import Navbar from '../../components/landing-page/Navbar';
import Product from '../../components/landing-page/Product';
import Testimonials from '../../components/landing-page/Testimonials';

export default function Home() {
  return (
    
    <div>
      <Navbar />
      <HeroSection />
      <AboutSection />
      <Product />
      <Testimonials/>
    </div>
  );
}
