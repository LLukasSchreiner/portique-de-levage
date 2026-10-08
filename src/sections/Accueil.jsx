import Feuille, { Cartouche } from './Feuille.jsx';
import Dessin from '../dessin/Dessin.jsx';
import { silhouette } from '../contenu/plans.js';
import { allerA } from '../defilement.js';
import './sections.css';

export default function Accueil() {
  return (
    <Feuille id="accueil" matiere="kraft" sansBord contenuClassName="accueil">
      <div className="accueil__texte">
        <Cartouche id="accueil" echelle="Maquette carton" />
        <h1 className="titre accueil__titre">
          <span>Portique</span>
          <span>de levage</span>
        </h1>
        <p className="main accueil__sous-titre">Lever 3 kg avec 1 m² de carton.</p>
      </div>
      <div className="accueil__dessin">
        <Dessin
          elements={silhouette.elements}
          cadre={silhouette.cadre}
          declenchement="auto"
          duree={3.2}
          couleur="#2b2017"
          grain={false}
          ariaLabel="Silhouette du portique, tracée au crayon"
        />
      </div>
      <button className="accueil__defiler tech" onClick={() => allerA('#projet')}>
        <span>Défiler</span>
        <span className="accueil__trait" />
      </button>
    </Feuille>
  );
}
