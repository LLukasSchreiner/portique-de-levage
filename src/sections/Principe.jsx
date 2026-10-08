import { useMemo, useRef } from 'react';
import Feuille, { Cartouche } from './Feuille.jsx';
import Dessin from '../dessin/Dessin.jsx';
import { planCinematique } from '../contenu/plans.js';
import { principe } from '../contenu/textes.js';
import { mouvementReduit } from '../defilement.js';

export default function Principe() {
  const ref = useRef(null);
  // le schéma se trace pendant que la section reste fixée à l'écran
  const declenchement = useMemo(
    () => (mouvementReduit ? 'auto' : {
      scrollTrigger: { trigger: '#principe', start: 'top top', end: '+=140%', pin: true, scrub: 0.6 },
    }),
    []
  );

  return (
    <Feuille id="principe" matiere="calque" ref={ref} contenuClassName="planche">
      <div className="planche__texte">
        <Cartouche id="principe" echelle="Schéma cinématique" />
        <h2 className="titre titre--moyen">Le principe</h2>
        <p className="texte">{principe.texte}</p>
        <p className="planche__legende main">{principe.legende}</p>
      </div>
      <div className="planche__dessin">
        <Dessin
          elements={planCinematique.elements}
          cadre={planCinematique.cadre}
          echelle={8}
          pieces={planCinematique.pieces}
          declenchement={declenchement}
          ariaLabel="Schéma cinématique : bâti encastré, glissière, palan et charge"
        />
      </div>
    </Feuille>
  );
}
