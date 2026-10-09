import { useMemo, useState } from 'react';
import Feuille, { Cartouche } from './Feuille.jsx';
import Dessin from '../dessin/Dessin.jsx';
import { planFace, planCote, planCoupe } from '../contenu/plans.js';
import { mouvementReduit } from '../defilement.js';

const VUES_LATERALES = {
  cote: { plan: planCote, label: 'Plan coté du portique, vue de côté' },
  coupe: { plan: planCoupe, label: 'Plan coté du portique, vue en coupe' },
};

const PDF = [
  { fichier: '/plans/plan-face.pdf', nom: 'Plan de face' },
  { fichier: '/plans/plan-cote.pdf', nom: 'Plan de côté' },
  { fichier: '/plans/plan-coupe.pdf', nom: 'Plan de coupe' },
];

export default function PlanCote() {
  const [vue, setVue] = useState('face');
  const declenchement = useMemo(
    () => (mouvementReduit ? 'auto' : {
      scrollTrigger: { trigger: '#plan', start: 'top top', end: '+=180%', pin: true, scrub: 0.6 },
    }),
    []
  );
  const laterale = VUES_LATERALES[vue];

  return (
    <Feuille id="plan" matiere="calque" contenuClassName="planche planche--plan">
      <div className="planche__texte">
        <Cartouche id="plan" echelle="Cotes en cm" />
        <h2 className="titre titre--moyen">Plan coté</h2>
        <p className="texte">
          Les cotes des plans de l'équipe (indice A, 08/10/2026). Survolez une pièce pour l'identifier.
        </p>
        <div className="onglets tech" role="tablist">
          <button role="tab" aria-selected={vue === 'face'} onClick={() => setVue('face')}>Vue de face</button>
          <button role="tab" aria-selected={vue === 'cote'} onClick={() => setVue('cote')}>Vue de côté</button>
          <button role="tab" aria-selected={vue === 'coupe'} onClick={() => setVue('coupe')}>Vue en coupe</button>
        </div>
        <div className="telechargement">
          <a className="telechargement__bouton tech" href="/plans/plans-engin-de-levage.zip" download="Plans engin de levage - Groupe HUITRE.zip">
            ↓ Télécharger les plans
          </a>
          <ul className="telechargement__liste tech">
            {PDF.map((p) => (
              <li key={p.fichier}>
                <a href={p.fichier} download={`${p.nom}.pdf`}>{p.nom} · PDF</a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="planche__dessin">
        {/* la vue de face reste montée (son tracé est lié au défilement) ; les autres vues se tracent à l'affichage */}
        <div hidden={vue !== 'face'}>
          <Dessin
            elements={planFace.elements}
            cadre={planFace.cadre}
            pieces={planFace.pieces}
            declenchement={declenchement}
            ariaLabel="Plan coté du portique, vue de face"
          />
        </div>
        {laterale && (
          <div className="planche__cote" key={vue}>
            <Dessin
              elements={laterale.plan.elements}
              cadre={laterale.plan.cadre}
              pieces={laterale.plan.pieces}
              declenchement="auto"
              duree={2.4}
              ariaLabel={laterale.label}
            />
          </div>
        )}
      </div>
    </Feuille>
  );
}
