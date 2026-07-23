import { FAQ } from './components/landing/FAQ';
import { Features } from './components/landing/Features';
import { FinalCTA } from './components/landing/FinalCTA';
import { Footer } from './components/landing/Footer';
import { Header } from './components/landing/Header';
import { Hero } from './components/landing/Hero';
import { HowItWorks } from './components/landing/HowItWorks';
import { Pricing } from './components/landing/Pricing';
import { Problem } from './components/landing/Problem';
import { ProductDetail } from './components/landing/ProductDetail';
import { SubscriptionFlow } from './components/landing/SubscriptionFlow';
import { Testimonials } from './components/landing/Testimonials';
import { Trust } from './components/landing/Trust';

export const LandingPage = () => (
  <div className="min-h-screen bg-background text-foreground">
    <Header />
    <main>
      <Hero />
      <Trust />
      <Problem />
      <Features />
      <HowItWorks />
      <Pricing />
      <SubscriptionFlow />
      <ProductDetail />
      <Testimonials />
      <FAQ />
      <FinalCTA />
    </main>
    <Footer />
  </div>
);
