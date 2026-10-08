import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);
if (import.meta.env.DEV && typeof window !== 'undefined') window.ScrollTrigger = ScrollTrigger; // débogage

export const mouvementReduit =
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let lenis = null;

// Défilement fluide (Lenis) synchronisé avec les animations au défilement (GSAP ScrollTrigger)
export function demarrerDefilement() {
  if (lenis || mouvementReduit) return lenis;
  lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  return lenis;
}

export function arreterDefilement() {
  if (!lenis) return;
  lenis.destroy();
  lenis = null;
}

export function allerA(cible, options = {}) {
  if (lenis) lenis.scrollTo(cible, { duration: 1.4, ...options });
  else {
    const el = typeof cible === 'string' ? document.querySelector(cible) : cible;
    if (typeof cible === 'number') window.scrollTo({ top: cible, behavior: 'smooth' });
    else el?.scrollIntoView({ behavior: 'smooth' });
  }
}

export { gsap, ScrollTrigger };
