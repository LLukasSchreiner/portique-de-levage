import { useLayoutEffect, useRef } from 'react';
import Feuille, { Cartouche } from './Feuille.jsx';
import { equipe } from '../contenu/textes.js';
import { gsap, mouvementReduit } from '../defilement.js';

// Générique de fin : une étiquette kraft par membre, accrochée à une ficelle
export default function Equipe() {
  const ref = useRef(null);

  useLayoutEffect(() => {
    if (mouvementReduit) return;
    const ctx = gsap.context(() => {
      // la chute est animée sur l'accroche ; l'étiquette garde son inclinaison et son balancement au survol
      gsap.from('.etiquette-accroche', {
        y: -90, rotate: () => gsap.utils.random(-18, 18), opacity: 0,
        duration: 1, stagger: 0.1, ease: 'elastic.out(1, 0.55)', clearProps: 'transform,opacity',
        scrollTrigger: { trigger: '.equipe__fil', start: 'top 85%', once: true },
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <Feuille id="equipe" matiere="kraft" ref={ref} contenuClassName="equipe">
      <Cartouche id="equipe" echelle="Générique" />
      <h2 className="titre titre--moyen">L'équipe</h2>
      <div className="equipe__fil">
        <svg className="equipe__ficelle" viewBox="0 0 1000 40" preserveAspectRatio="none" aria-hidden="true">
          <path d="M 0 6 Q 500 46 1000 6" />
        </svg>
        <ul className="equipe__liste">
          {equipe.map((m, i) => (
            <li key={m.nom} className="etiquette-accroche">
              <div className="etiquette" style={{ '--r': `${[-4, 3, -2, 5, -3][i % 5]}deg` }}>
                <span className="etiquette__oeillet" />
                <span className="etiquette__num tech">{String(i + 1).padStart(2, '0')}</span>
                {m.prenom && <span className="etiquette__prenom main">{m.prenom}</span>}
                <span className="etiquette__nom affiche">{m.nom}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Feuille>
  );
}
