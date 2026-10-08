import { Suspense, lazy, useLayoutEffect, useRef } from 'react';
import Feuille, { Cartouche } from './Feuille.jsx';
import { Vue3D } from '../scene/commun.jsx';
import { calculs } from '../contenu/textes.js';
import { gsap, ScrollTrigger, mouvementReduit } from '../defilement.js';

const SceneEfforts = lazy(() => import('../scene/SceneEfforts.jsx'));
const CIBLE = [0, 0.4, 0];
const pct = (v) => `${(v * 100).toFixed(1).replace('.', ',')} %`;

export default function Dimensionnement() {
  const ref = useRef(null);
  const progression = useRef(mouvementReduit ? 1 : 0);
  const { carton } = calculs;

  useLayoutEffect(() => {
    if (mouvementReduit) return;
    const ctx = gsap.context(() => {
      // les flèches d'effort poussent au fur et à mesure que la feuille arrive
      ScrollTrigger.create({
        trigger: ref.current, start: 'top 70%', end: 'top 5%', scrub: true,
        onUpdate: (self) => { progression.current = self.progress; },
      });
      gsap.from('.calcul', {
        x: 40, opacity: 0, duration: 0.5, stagger: 0.07, ease: 'power2.out',
        scrollTrigger: { trigger: '.dim__calculs', start: 'top 75%' },
      });
      gsap.from('.calcul__verdict', {
        scale: 1.8, opacity: 0, rotate: -12, duration: 0.35, stagger: 0.15, ease: 'back.out(2.5)',
        scrollTrigger: { trigger: '.dim__calculs', start: 'top 45%' },
      });
      gsap.from('.jauge__rempli, .jauge__pertes', {
        scaleX: 0, transformOrigin: 'left', duration: 1.1, stagger: 0.25, ease: 'power3.out',
        scrollTrigger: { trigger: '.jauge', start: 'top 85%' },
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <Feuille id="dimensionnement" matiere="kraft" ref={ref} contenuClassName="dim">
      <div className="dim__entete">
        <Cartouche id="dimensionnement" echelle="Calculs" />
        <h2 className="titre titre--moyen">Dimensionnement</h2>
        <p className="texte">{calculs.intro}</p>
      </div>

      <Vue3D className="dim__vue" camera={{ position: [0.75, 0.85, 2.35], fov: 30 }} cible={CIBLE}>
        <Suspense fallback={null}>
          <SceneEfforts progression={progression} />
        </Suspense>
      </Vue3D>

      <div className="dim__calculs">
        <ul>
          {calculs.lignes.map((l) => (
            <li key={l.nom} className="calcul">
              <span className="calcul__nom">{l.nom}</span>
              <span className="calcul__formule tech">{l.formule}</span>
              <span className="calcul__resultat affiche">{l.resultat}</span>
              {l.verdict && <span className="calcul__verdict tech">{l.verdict}</span>}
            </li>
          ))}
        </ul>

        <div className="jauge">
          <p className="tech jauge__titre">Carton utilisé sur 1 m²</p>
          <div className="jauge__barre">
            <span className="jauge__rempli" style={{ width: `${carton.utilise * 100}%` }} />
            <span className="jauge__pertes" style={{ left: `${carton.utilise * 100}%`, width: `${(carton.avecPertes - carton.utilise) * 100}%` }} />
          </div>
          <div className="jauge__legende main">
            <span>{carton.utilise.toString().replace('.', ',')} m² de pièces ({pct(carton.utilise)})</span>
            <span>+ 10 % de chutes = {carton.avecPertes.toString().replace('.', ',')} m²</span>
            <span>reste {pct(carton.disponible - carton.avecPertes)}</span>
          </div>
        </div>
      </div>
    </Feuille>
  );
}
