import { credits, equipe } from '../contenu/textes.js';
import { allerA } from '../defilement.js';

// Pied de page : l'école, l'équipe et les crédits obligatoires (textures, polices, outils)
export default function PiedDePage() {
  return (
    <footer className="pied">
      <div className="pied__bloc pied__titre">
        <p className="affiche">Portique de levage</p>
        <p>Maquette carton et engin réel.</p>
        <p className="tech">{credits.ecole} · {credits.annee}</p>
      </div>

      <div className="pied__bloc">
        <h2 className="tech">Équipe</h2>
        <ul>
          {equipe.map((m) => (
            <li key={m.nom}>{m.prenom ? `${m.prenom} ${m.nom}` : m.nom}</li>
          ))}
        </ul>
      </div>

      <div className="pied__bloc">
        <h2 className="tech">Crédits</h2>
        <p>
          Textures : {credits.textures.map((t) => `${t.nom} (${t.auteur})`).join(', ')},{' '}
          <a href="https://polyhaven.com" target="_blank" rel="noreferrer">Poly Haven</a>, licence CC0.
        </p>
        <p>Polices : {credits.polices.join(', ')}, licence SIL Open Font License.</p>
        <p>Réalisé avec {credits.outils.join(', ')}.</p>
      </div>

      <button className="pied__haut tech" onClick={() => allerA(0)}>Retour en haut ↑</button>
    </footer>
  );
}
