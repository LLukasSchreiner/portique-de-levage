import { useLayoutEffect, useState } from 'react';
import { ScrollTrigger } from '../defilement.js';
import { sections } from '../contenu/textes.js';
import { allerA } from '../defilement.js';

// Cartouche fixe en bas à droite : numéro de planche et titre de la section en cours
export default function Reperage() {
  const [courante, setCourante] = useState(0);

  useLayoutEffect(() => {
    // section en cours = la dernière dont le haut a dépassé le milieu de l'écran
    const maj = () => {
      let i = 0;
      sections.forEach((x, k) => {
        const el = document.getElementById(x.id);
        if (el && el.getBoundingClientRect().top < window.innerHeight * 0.55) i = k;
      });
      setCourante(i);
    };
    const st = ScrollTrigger.create({ start: 0, end: 'max', onUpdate: maj, onRefresh: maj });
    maj();
    return () => st.kill();
  }, []);

  const s = sections[courante];
  const total = String(sections.length - 1).padStart(2, '0');

  return (
    <nav className="reperage tech" aria-label="Sections">
      <ol className="reperage__liste">
        {sections.map((x, i) => (
          <li key={x.id}>
            <button
              className={i === courante ? 'actif' : ''}
              onClick={() => allerA(`#${x.id}`)}
              aria-label={x.titre}
              title={x.titre}
            />
          </li>
        ))}
      </ol>
      <div className="reperage__cartouche">
        <span>PL. {String(courante).padStart(2, '0')}/{total}</span>
        <span key={s.id} className="reperage__titre">{s.titre}</span>
      </div>
    </nav>
  );
}
