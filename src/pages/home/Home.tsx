import AboutSection from '../../components/landing-page/AboutSection';
import CTA from '../../components/landing-page/CTA';
import Faq from '../../components/landing-page/Faq';
import Footer from '../../components/landing-page/Footer';
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
      <Testimonials />
      <CTA />
      <Faq />
      <Footer/>
    </div>
  );
}
