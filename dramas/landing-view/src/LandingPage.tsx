import { useEffect } from 'react';
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
import { I18nProvider } from './i18n/I18nProvider';

function LandingContent() {
  // Reveal elements once as they enter the viewport. Keeping this observer here
  // avoids repeating animation setup in every section component.
  useEffect(() => {
    const elements = [...document.querySelectorAll<HTMLElement>('[data-reveal]')];
    if (!('IntersectionObserver' in window)) {
      elements.forEach((element) => element.classList.add('is-revealed'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-revealed');
        observer.unobserve(entry.target);
      }),
      { threshold: 0.12, rootMargin: '0px 0px -7% 0px' },
    );
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  return (
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
}

export const LandingPage = () => (
  <I18nProvider>
    <LandingContent />
  </I18nProvider>
);
