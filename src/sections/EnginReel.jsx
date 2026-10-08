import { Suspense, lazy, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import Feuille, { Cartouche } from './Feuille.jsx';
import { Vue3D } from '../scene/commun.jsx';
import { reel } from '../contenu/textes.js';
import { gsap, mouvementReduit } from '../defilement.js';
import { touches, prendreCommandes, rendreCommandes, inscrirePilote } from '../scene/mecanisme.js';
import './reel.css';

const SceneReel = lazy(() => import('../scene/SceneReel.jsx'));
const m = (v) => `${v.toFixed(2).replace('.', ',')} m`;

// L'engin réel : son propre thème, « acier et chantier »
export default function EnginReel() {
  const ref = useRef(null);
  const vue = useRef(null);
  const [actif, setActif] = useState(null);
  const [pilote, setPilote] = useState(false);
  const [etat, setEtat] = useState({ x: 0, hauteur: 0, cable: 0 });

  // les flèches pilotent ce portique seulement quand sa vue occupe l'écran (jamais la maquette en même temps)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      const a = e.intersectionRatio > 0.6;
      if (a) prendreCommandes('reel'); else rendreCommandes('reel');
      setPilote(a);
    }, { threshold: [0, 0.6, 1] });
    obs.observe(vue.current);
    const desinscrire = inscrirePilote('reel', vue.current);
    return () => { obs.disconnect(); desinscrire(); rendreCommandes('reel'); };
  }, []);

  const bouton = (cle, libelle, symbole) => ({
    'aria-label': libelle,
    children: symbole,
    onPointerDown: (e) => { e.currentTarget.setPointerCapture(e.pointerId); prendreCommandes('reel'); touches[cle] = true; },
    onPointerUp: () => { touches[cle] = false; },
    onPointerCancel: () => { touches[cle] = false; },
    onContextMenu: (e) => e.preventDefault(),
  });
  const point = reel.points.find((p) => p.id === actif);
  const choisir = useCallback((id) => setActif((v) => (v === id ? null : id)), []);

  useLayoutEffect(() => {
    if (mouvementReduit) return;
    const ctx = gsap.context(() => {
      gsap.from('.reel-ligne', {
        x: -30, opacity: 0, duration: 0.45, stagger: 0.06, ease: 'power2.out',
        scrollTrigger: { trigger: '.reel-comparatif', start: 'top 80%' },
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <Feuille id="reel" matiere="acier" ref={ref} contenuClassName="reel">
      <div className="reel__scene" ref={vue}>
        <Vue3D className="reel__vue" camera={{ position: [10.5, 6.4, 16.5], fov: 35, near: 0.1, far: 120 }}>
          <Suspense fallback={null}>
            <SceneReel points={reel.points} actif={actif} onChoisir={choisir} onEtat={setEtat} />
          </Suspense>
        </Vue3D>

        <div className={`reel__entete ${point ? 'reel__entete--discret' : ''}`}>
          <Cartouche id="reel" echelle="Échelle 1:1" />
          <h2 className="titre titre--moyen">L'engin réel</h2>
          <p className="reel__accroche affiche">{reel.accroche}</p>
          <p className="texte">{reel.intro}</p>
          <p className={`reel__aide tech ${pilote ? 'actif' : ''}`}>
            <kbd>←</kbd><kbd>→</kbd> chariot <kbd>↑</kbd><kbd>↓</kbd> treuil · glisser pour tourner · repères jaunes
          </p>
        </div>

        <ol className="reel__liste tech" aria-label="Éléments techniques">
          {reel.points.map((p) => (
            <li key={p.id}>
              <button className={actif === p.id ? 'actif' : ''} onClick={() => choisir(p.id)}>
                <span className="reel__num">{p.numero}</span>
                {p.titre}
              </button>
            </li>
          ))}
        </ol>

        {point && (
          <aside key={point.id} className="reel__fiche" aria-live="polite">
            <p className="tech reel__fiche-num">Repère {point.numero}</p>
            <h3 className="affiche">{point.titre}</h3>
            <p>{point.texte}</p>
            <button className="lien-passer" onClick={() => setActif(null)}>Vue d'ensemble</button>
          </aside>
        )}
        <dl className="reel__mesures tech">
          <div><dt>Chariot</dt><dd>{m(etat.x)}</dd></div>
          <div><dt>Hauteur de la caisse</dt><dd>{m(etat.hauteur)}</dd></div>
          <div><dt>Câble enroulé</dt><dd>{m(etat.cable)}</dd></div>
        </dl>

        <div className="reel__pave" role="group" aria-label="Commandes du portique réel">
          <button className="haut" {...bouton('haut', 'Monter la charge', '↑')} />
          <button className="gauche" {...bouton('gauche', 'Chariot à gauche', '←')} />
          <button className="bas" {...bouton('bas', 'Descendre la charge', '↓')} />
          <button className="droite" {...bouton('droite', 'Chariot à droite', '→')} />
        </div>
      </div>

      <div className="reel-comparatif">
        <h3 className="affiche">Maquette / réel</h3>
        <table>
          <thead>
            <tr className="tech"><th scope="col"></th><th scope="col">Maquette carton</th><th scope="col">Portique réel</th></tr>
          </thead>
          <tbody>
            {reel.comparatif.map((l) => (
              <tr key={l.critere} className="reel-ligne">
                <th scope="row" className="tech">{l.critere}</th>
                <td>{l.maquette}</td>
                <td>{l.reel}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Feuille>
  );
}
