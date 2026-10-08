import { useMemo, useState } from 'react';
import Feuille, { Cartouche } from './Feuille.jsx';
import Dessin from '../dessin/Dessin.jsx';
import { planFace, planCote } from '../contenu/plans.js';
import { mouvementReduit } from '../defilement.js';

export default function PlanCote() {
  const [vue, setVue] = useState('face');
  const declenchement = useMemo(
    () => (mouvementReduit ? 'auto' : {
      scrollTrigger: { trigger: '#plan', start: 'top top', end: '+=180%', pin: true, scrub: 0.6 },
    }),
    []
  );

  return (
    <Feuille id="plan" matiere="calque" contenuClassName="planche planche--plan">
      <div className="planche__texte">
        <Cartouche id="plan" echelle="Cotes en cm" />
        <h2 className="titre titre--moyen">Plan coté</h2>
        <p className="texte">
          Les cotes de la maquette telle qu'elle a été dessinée. Survolez une pièce pour l'identifier.
        </p>
        <div className="onglets tech" role="tablist">
          <button role="tab" aria-selected={vue === 'face'} onClick={() => setVue('face')}>Vue de face</button>
          <button role="tab" aria-selected={vue === 'cote'} onClick={() => setVue('cote')}>Vue de côté</button>
        </div>
      </div>
      <div className="planche__dessin">
        {/* la vue de face reste montée (son tracé est lié au défilement) ; la vue de côté se trace à l'affichage */}
        <div hidden={vue !== 'face'}>
          <Dessin
            elements={planFace.elements}
            cadre={planFace.cadre}
            pieces={planFace.pieces}
            declenchement={declenchement}
            ariaLabel="Plan coté du portique, vue de face"
          />
        </div>
        {vue === 'cote' && (
          <div className="planche__cote">
            <Dessin
              elements={planCote.elements}
              cadre={planCote.cadre}
              pieces={planCote.pieces}
              declenchement="auto"
              duree={2.4}
              ariaLabel="Plan coté du portique, vue de côté"
            />
          </div>
        )}
      </div>
    </Feuille>
  );
}
