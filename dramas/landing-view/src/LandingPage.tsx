import { useEffect } from 'react';
import { FAQ } from './components/landing/FAQ';
import { FeatureBento } from './components/landing/FeatureBento';
import { FinalCTA } from './components/landing/FinalCTA';
import { Footer } from './components/landing/Footer';
import { Header } from './components/landing/Header';
import { Hero } from './components/landing/Hero';
import { HowItWorks } from './components/landing/HowItWorks';
import { LocalFit } from './components/landing/LocalFit';
import { ModuleTour } from './components/landing/ModuleTour';
import { MultiBranch } from './components/landing/MultiBranch';
import { PainSolution } from './components/landing/PainSolution';
import { Pricing } from './components/landing/Pricing';
import { Testimonials } from './components/landing/Testimonials';
import { I18nProvider, useI18n } from './i18n/I18nProvider';

function LandingContent() {
  //
  const { t } = useI18n();
  useEffect(() => {
    //
    const elements = [...document.querySelectorAll<HTMLElement>('[data-reveal]')];
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion || !('IntersectionObserver' in window)) {
      elements.forEach((element) => element.classList.add('is-revealed'));
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-revealed');
        observer.unobserve(entry.target);
      }),
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
    );
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="landing">
      <a className="skip-link" href="#main">{t.navigation.skip}</a>
      <Header />
      <main id="main">
        <Hero />
        <PainSolution />
        <FeatureBento />
        <ModuleTour />
        <MultiBranch />
        <HowItWorks />
        <LocalFit />
        <Testimonials />
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
