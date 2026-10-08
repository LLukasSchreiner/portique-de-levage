import { useLayoutEffect, useRef } from 'react';
import { demarrerDefilement, gsap, ScrollTrigger, mouvementReduit } from './defilement.js';
import Accueil from './sections/Accueil.jsx';
import Projet from './sections/Projet.jsx';
import Principe from './sections/Principe.jsx';
import PlanCote from './sections/PlanCote.jsx';
import Montage from './sections/Montage.jsx';
import Dimensionnement from './sections/Dimensionnement.jsx';
import Essayer from './sections/Essayer.jsx';
import Equipe from './sections/Equipe.jsx';
import EnginReel from './sections/EnginReel.jsx';
import Reperage from './sections/Reperage.jsx';
import PiedDePage from './sections/PiedDePage.jsx';

export default function App() {
  const racine = useRef(null);

  useLayoutEffect(() => {
    demarrerDefilement();
    if (mouvementReduit) return;
    // Transition entre feuilles : la suivante glisse par-dessus, la précédente recule et s'assombrit
    const ctx = gsap.context(() => {
      const feuilles = gsap.utils.toArray('.feuille');
      feuilles.forEach((f, i) => {
        const suivante = feuilles[i + 1];
        if (!suivante) return;
        const tl = gsap.timeline({
          scrollTrigger: { trigger: suivante, start: 'top bottom', end: 'top top', scrub: true },
        });
        tl.to(f.querySelector('.feuille__contenu'), { yPercent: 18, scale: 0.96, ease: 'none' }, 0)
          .to(f.querySelector('.feuille__voile'), { opacity: 0.55, ease: 'none' }, 0);
      });
    }, racine);
    const rafraichir = () => ScrollTrigger.refresh();
    window.addEventListener('load', rafraichir);
    document.fonts?.ready.then(rafraichir);
    return () => { ctx.revert(); window.removeEventListener('load', rafraichir); };
  }, []);

  return (
    <main ref={racine}>
      <Accueil />
      <Projet />
      <Principe />
      <PlanCote />
      <Montage />
      <Dimensionnement />
      <Essayer />
      <Equipe />
      <EnginReel />
      <PiedDePage />
      <Reperage />
    </main>
  );
}
