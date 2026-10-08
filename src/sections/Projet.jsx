import { useLayoutEffect, useRef } from 'react';
import Feuille, { Cartouche } from './Feuille.jsx';
import { projet } from '../contenu/textes.js';
import { gsap, mouvementReduit } from '../defilement.js';

export default function Projet() {
  const ref = useRef(null);

  useLayoutEffect(() => {
    if (mouvementReduit) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: '.projet__chiffres', start: 'top 75%' } });
      tl.from('.chiffre__cote line, .chiffre__cote path', { strokeDashoffset: 1, duration: 0.6, stagger: 0.04, ease: 'power2.out' })
        .from('.chiffre__valeur', { yPercent: 40, opacity: 0, duration: 0.6, stagger: 0.08, ease: 'back.out(2)' }, 0.15)
        .from('.chiffre__label', { opacity: 0, duration: 0.4, stagger: 0.08 }, 0.45);
      gsap.from('.projet__materiel', {
        rotate: -6, y: 60, opacity: 0, duration: 0.8, ease: 'back.out(1.6)',
        scrollTrigger: { trigger: '.projet__materiel', start: 'top 85%' },
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <Feuille id="projet" matiere="calque" ref={ref} contenuClassName="projet">
      <Cartouche id="projet" />
      <div className="projet__entete">
        <h2 className="titre titre--moyen">Le projet</h2>
        <p className="texte">{projet.intro}</p>
      </div>

      <ul className="projet__chiffres">
        {projet.chiffres.map((c) => (
          <li key={c.label} className="chiffre">
            <svg className="chiffre__cote" viewBox="0 0 100 14" preserveAspectRatio="none" aria-hidden="true">
              <line x1="0" y1="0" x2="0" y2="14" pathLength="1" />
              <line x1="100" y1="0" x2="100" y2="14" pathLength="1" />
              <line x1="0" y1="7" x2="100" y2="7" pathLength="1" />
              <path d="M -3 10 L 3 4 M 97 10 L 103 4" pathLength="1" />
            </svg>
            <span className="chiffre__valeur">
              <span className="affiche">{c.valeur}</span>
              <span className="chiffre__unite tech">{c.unite}</span>
            </span>
            <span className="chiffre__label main">{c.label}</span>
          </li>
        ))}
      </ul>

      <aside className="projet__materiel">
        <span className="scotch" style={{ top: -14, left: '38%', transform: 'rotate(-3deg)' }} />
        <h3 className="tech">Bon de matériel</h3>
        <ul>
          {projet.materiel.map((m) => <li key={m} className="main">{m}</li>)}
        </ul>
      </aside>
    </Feuille>
  );
}
