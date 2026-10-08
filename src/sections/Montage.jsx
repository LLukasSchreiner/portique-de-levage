import { Suspense, lazy, useLayoutEffect, useRef, useState } from 'react';
import Feuille, { Cartouche } from './Feuille.jsx';
import Dessin from '../dessin/Dessin.jsx';
import { Vue3D } from '../scene/commun.jsx';
import { silhouette } from '../contenu/plans.js';
import { notice } from '../contenu/textes.js';
import { gsap, ScrollTrigger, allerA, mouvementReduit } from '../defilement.js';

const SceneMontage = lazy(() => import('../scene/SceneMontage.jsx'));
const N = notice.etapes.length;
const PAR_ETAPE = 70; // % d'écran de défilement par étape

export default function Montage() {
  const ref = useRef(null);
  const progression = useRef(mouvementReduit ? N : 0);
  const declencheur = useRef(null);
  const plan = useRef(null);
  const [etape, setEtape] = useState(mouvementReduit ? N : 0);

  useLayoutEffect(() => {
    if (mouvementReduit) return;
    const st = ScrollTrigger.create({
      trigger: ref.current,
      start: 'top top',
      end: `+=${N * PAR_ETAPE}%`,
      pin: true,
      scrub: 0.5,
      // la page s'arrête sur chaque étape terminée
      snap: { snapTo: 1 / N, duration: { min: 0.25, max: 0.7 }, delay: 0.08, ease: 'power2.inOut' },
      onUpdate: (self) => {
        const p = self.progress * N;
        progression.current = p;
        setEtape(p < 0.05 ? 0 : Math.min(N, Math.ceil(p - 0.05)));
        if (plan.current) plan.current.style.opacity = String(Math.max(0, 1 - p / 0.7));
      },
    });
    declencheur.current = st;
    return () => st.kill();
  }, []);

  const allerEtape = (k) => {
    const st = declencheur.current;
    if (st) allerA(st.start + ((st.end - st.start) * k) / N + 1);
  };

  const e = etape > 0 ? notice.etapes[etape - 1] : null;

  return (
    <Feuille id="montage" matiere="calque" ref={ref} contenuClassName="montage">
      {/* le plan de face reste affiché au début : les pièces viennent se poser dessus */}
      <div className="montage__plan" ref={plan} aria-hidden="true">
        <Dessin elements={silhouette.elements} cadre={silhouette.cadre} declenchement="auto" duree={0.01} />
      </div>

      <Vue3D className="montage__vue" camera={{ position: [0, 0.4, 2.3], fov: 30 }}>
        <Suspense fallback={null}>
          <SceneMontage progression={progression} />
        </Suspense>
      </Vue3D>

      <div className="montage__panneau">
        <Cartouche id="montage" echelle="Notice" />
        <div key={etape} className="montage__etape">
          <p className="montage__compteur">
            <span className="affiche">{String(etape).padStart(2, '0')}</span>
            <span className="tech">/{String(N).padStart(2, '0')}</span>
          </p>
          <h2 className="affiche montage__titre">{e ? e.titre : 'Montage'}</h2>
          <p className="texte">{e ? e.texte : `Éléments fournis : ${notice.fournis}`}</p>
          {etape === 0 && <p className="main montage__aide">Faites défiler : chaque étape se monte sous vos yeux.</p>}
        </div>
      </div>

      <nav className="montage__nav tech" aria-label="Étapes du montage">
        <ol>
          {notice.etapes.map((x, i) => (
            <li key={x.titre}>
              <button className={i < etape ? 'fait' : ''} onClick={() => allerEtape(i + 1)} title={x.titre}>
                {i + 1}
              </button>
            </li>
          ))}
        </ol>
        <button className="lien-passer" onClick={() => allerA(declencheur.current ? declencheur.current.end + 2 : '#dimensionnement')}>
          Passer le montage
        </button>
      </nav>
    </Feuille>
  );
}
