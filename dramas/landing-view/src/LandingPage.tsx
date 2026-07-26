import { FAQ } from './components/landing/FAQ';
import { Features } from './components/landing/Features';
import { FinalCTA } from './components/landing/FinalCTA';
import { Footer } from './components/landing/Footer';
import { Header } from './components/landing/Header';
import { Hero } from './components/landing/Hero';
import { HowItWorks } from './components/landing/HowItWorks';
import { Pricing } from './components/landing/Pricing';
import { Problem } from './components/landing/Problem';
import { Trust } from './components/landing/Trust';

export const LandingPage = () => (
  <div className="landing-page">
    <Header />
    <main>
      <Hero />
      <Trust />
      <Problem />
      <Features />
      <HowItWorks />
      <Pricing />
      <FAQ />
      <FinalCTA />
    </main>
    <Footer />
  </div>
);
