import { forwardRef } from 'react';
import { sections } from '../contenu/textes.js';

// Une section = une feuille, en carton kraft ou en papier calque
const Feuille = forwardRef(function Feuille({ id, matiere = 'kraft', className = '', contenuClassName = '', children, sansBord }, ref) {
  return (
    <section id={id} ref={ref} className={`feuille ${matiere} ${className}`} data-titre={titreDe(id)}>
      {matiere === 'kraft' && !sansBord && <BordCarton />}
      {matiere === 'acier' && <div className="bande-chantier" aria-hidden="true" />}
      <div className={`feuille__contenu ${contenuClassName}`}>{children}</div>
      <div className="feuille__voile" />
    </section>
  );
});
export default Feuille;

export function titreDe(id) {
  return sections.find((s) => s.id === id)?.titre ?? '';
}
export function numeroDe(id) {
  return String(sections.findIndex((s) => s.id === id)).padStart(2, '0');
}

// Tranche de carton ondulé : deux parements et la cannelure entre les deux
export function BordCarton() {
  const ondes = 160;
  let d = 'M 0 8';
  for (let i = 0; i < ondes; i++) {
    const x = i * 12;
    d += ` Q ${x + 3} 2.5 ${x + 6} 8 Q ${x + 9} 13.5 ${x + 12} 8`;
  }
  return (
    <svg className="bord-carton" viewBox="0 0 1920 16" preserveAspectRatio="none" aria-hidden="true">
      <rect x="0" y="0" width="1920" height="16" fill="#8a6640" />
      <path d={d} fill="none" stroke="#5c4128" strokeWidth="1.4" />
      <line x1="0" y1="1.2" x2="1920" y2="1.2" stroke="#4d3520" strokeWidth="2.4" />
      <line x1="0" y1="14.8" x2="1920" y2="14.8" stroke="#4d3520" strokeWidth="2.4" />
    </svg>
  );
}

export function Cartouche({ id, echelle }) {
  return (
    <div className="cartouche">
      <span className="cartouche__num">PL. {numeroDe(id)}</span>
      <span>{titreDe(id)}</span>
      {echelle && <span>{echelle}</span>}
    </div>
  );
}
