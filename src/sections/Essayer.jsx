import { Suspense, lazy, useEffect, useRef, useState } from 'react';
import Feuille, { Cartouche } from './Feuille.jsx';
import { Vue3D } from '../scene/commun.jsx';
import { touches, prendreCommandes, rendreCommandes, inscrirePilote } from '../scene/mecanisme.js';

const SceneSimulateur = lazy(() => import('../scene/SceneSimulateur.jsx'));
const cm = (v) => `${(v * 100).toFixed(1).replace('.', ',')} cm`;

export default function Essayer() {
  const ref = useRef(null);
  const [actif, setActif] = useState(false);
  const [etat, setEtat] = useState({ x: 0, hauteur: 0, corde: 0 });

  // les flèches du clavier ne pilotent la grue que lorsque la section occupe l'écran
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      const a = e.intersectionRatio > 0.6;
      if (a) prendreCommandes('maquette'); else rendreCommandes('maquette');
      setActif(a);
    }, { threshold: [0, 0.6, 1] });
    obs.observe(ref.current);
    const desinscrire = inscrirePilote('maquette', ref.current);
    return () => { obs.disconnect(); desinscrire(); rendreCommandes('maquette'); };
  }, []);

  const bouton = (cle, libelle, symbole) => ({
    'aria-label': libelle,
    children: symbole,
    onPointerDown: (e) => { e.currentTarget.setPointerCapture(e.pointerId); touches[cle] = true; },
    onPointerUp: () => { touches[cle] = false; },
    onPointerCancel: () => { touches[cle] = false; },
    onContextMenu: (e) => e.preventDefault(),
  });

  return (
    <Feuille id="essayer" matiere="calque" ref={ref} contenuClassName="essayer">
      <Vue3D className="essayer__vue" camera={{ position: [0.95, 0.72, 1.4], fov: 34 }}>
        <Suspense fallback={null}>
          <SceneSimulateur onEtat={setEtat} />
        </Suspense>
      </Vue3D>

      <div className="essayer__entete">
        <Cartouche id="essayer" echelle="Simulateur" />
        <h2 className="titre titre--moyen">À vous</h2>
        <p className="texte">
          Pilotez la maquette : le chariot glisse le long de la poutre, le palan monte la charge.
          Pour lever le seau de 1 cm, il faut tirer 5 cm de corde.
        </p>
        <p className={`essayer__consigne tech ${actif ? 'actif' : ''}`}>
          <kbd>←</kbd><kbd>→</kbd> chariot <kbd>↑</kbd><kbd>↓</kbd> levage · glisser pour tourner autour
        </p>
      </div>

      <dl className="essayer__mesures tech">
        <div><dt>Chariot</dt><dd>{cm(etat.x)}</dd></div>
        <div><dt>Hauteur de la charge</dt><dd>{cm(etat.hauteur)}</dd></div>
        <div><dt>Corde tirée</dt><dd>{cm(etat.corde)}</dd></div>
      </dl>

      <div className="essayer__pave" role="group" aria-label="Commandes">
        <button className="haut" {...bouton('haut', 'Monter la charge', '↑')} />
        <button className="gauche" {...bouton('gauche', 'Chariot à gauche', '←')} />
        <button className="bas" {...bouton('bas', 'Descendre la charge', '↓')} />
        <button className="droite" {...bouton('droite', 'Chariot à droite', '→')} />
      </div>
    </Feuille>
  );
}
