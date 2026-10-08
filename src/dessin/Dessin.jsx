import { useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { gsap, mouvementReduit } from '../defilement.js';
import { preparerDessin } from './geometrie.js';
import Repere from './Repere.jsx';
import { tuileGrain } from './grain.js';
import './dessin.css';

// Plan tracé au crayon. Les traits se dessinent dans l'ordre de leur « etape ».
//   declenchement = { scrollTrigger }  → tracé lié au défilement (scrub)
//   declenchement = 'auto'              → tracé joué une fois quand le dessin entre à l'écran
// pieces = { id: { nom, repere, detail, zone: [[x0,y0],[x1,y1]] | [...], ancre: [x,y], etiquette: [x,y], cote: 'g'|'d' } }
export default function Dessin({
  elements, cadre, echelle = 10, pieces = {}, declenchement = 'auto', duree = 3,
  className = '', couleur = 'var(--graphite)', papier = '#eceee7', grain = true, onTimeline, ariaLabel,
}) {
  const id = useId().replace(/:/g, '');
  const racine = useRef(null);
  const [actif, setActif] = useState(null);
  const d = useMemo(() => preparerDessin(elements, cadre, echelle), [elements, cadre, echelle]);

  // Regroupe les traits par pièce pour pouvoir mettre une pièce en avant
  const groupes = useMemo(() => {
    const m = new Map();
    for (const t of d.traits) {
      const cle = t.piece ?? '_';
      if (!m.has(cle)) m.set(cle, []);
      m.get(cle).push(t);
    }
    return [...m.entries()];
  }, [d]);

  useLayoutEffect(() => {
    const el = racine.current;
    const ctx = gsap.context(() => {
      const traits = gsap.utils.toArray(el.querySelectorAll('.trait'));
      const textes = gsap.utils.toArray(el.querySelectorAll('.dessin__texte'));
      if (mouvementReduit) return;
      gsap.set(traits, { strokeDashoffset: 1 });
      gsap.set(textes, { opacity: 0, clipPath: 'inset(0 100% 0 0)' });

      // les sélecteurs du déclencheur visent la page entière, pas l'intérieur du SVG
      const st = declenchement !== 'auto' ? { ...declenchement.scrollTrigger } : null;
      if (st && typeof st.trigger === 'string') st.trigger = document.querySelector(st.trigger);
      const tl = gsap.timeline({
        paused: declenchement === 'auto',
        defaults: { ease: 'none' },
        ...(st ? { scrollTrigger: st } : {}),
      });
      const etapes = [...new Set([...traits, ...textes].map((n) => +n.dataset.etape))].sort((a, b) => a - b);
      for (const e of etapes) {
        const tr = traits.filter((n) => +n.dataset.etape === e);
        const tx = textes.filter((n) => +n.dataset.etape === e);
        const label = `e${e}`;
        tl.addLabel(label);
        if (tr.length) tl.to(tr, { strokeDashoffset: 0, duration: 1, stagger: Math.min(0.12, 1.2 / tr.length) }, label);
        if (tx.length) tl.to(tx, { opacity: 1, clipPath: 'inset(0 0% 0 0)', duration: 0.6, stagger: 0.1 }, tr.length ? '>-0.4' : label);
      }
      if (declenchement === 'auto') {
        tl.duration(duree);
        const obs = new IntersectionObserver(([entree]) => {
          if (entree.isIntersecting) { tl.play(); obs.disconnect(); }
        }, { threshold: 0.35 });
        obs.observe(el);
      }
      onTimeline?.(tl);
    }, el);
    return () => ctx.revert();
  }, [d, declenchement, duree, onTimeline]);

  const listePieces = Object.entries(pieces);
  const pieceActive = actif ? pieces[actif] : null;

  return (
    <svg
      ref={racine}
      className={`dessin ${actif ? 'dessin--focus' : ''} ${className}`}
      viewBox={`0 0 ${d.largeur} ${d.hauteur}`}
      style={{ color: couleur }}
      role="img"
      aria-label={ariaLabel}
      onPointerLeave={() => setActif(null)}
    >
      <defs>
        {/* Grain de graphite : mouchetures couleur papier posées par-dessus les traits */}
        <pattern id={`grain-${id}`} width="160" height="160" patternUnits="userSpaceOnUse">
          <image href={tuileGrain(papier)} width="160" height="160" />
        </pattern>
        <pattern id={`hachures-${id}`} width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="7" stroke="currentColor" strokeWidth="1.1" />
        </pattern>
      </defs>

      <g>
        {groupes.map(([piece, traits]) => (
          <g key={piece} className={`dessin__groupe ${piece === actif ? 'actif' : ''}`}>
            {traits.map((t, i) => (
              <path
                key={i}
                className={`trait ${t.fin ? 'trait--fin' : ''}`}
                d={t.d}
                pathLength="1"
                data-etape={t.etape}
                stroke={t.couleur ?? 'currentColor'}
                strokeWidth={t.epaisseur}
                fill="none"
                strokeLinecap="round"
                strokeDasharray="1 1"
              />
            ))}
          </g>
        ))}
        {d.textes.map((t, i) => (
          <text
            key={i}
            className={`dessin__texte ${t.police === 'tech' ? 'tech' : 'main'} ${t.cote ? 'dessin__texte--cote' : ''}`}
            data-etape={t.etape}
            x={t.x}
            y={t.y}
            fontSize={t.taillePx}
            textAnchor={t.ancre ?? 'start'}
            fill={t.couleur ?? 'currentColor'}
            transform={t.rotation ? `rotate(${t.rotation} ${t.x} ${t.y})` : undefined}
          >
            {t.texte}
          </text>
        ))}
      </g>

      {/* Hachures de la pièce survolée */}
      {pieceActive && pieceActive.hachures !== false && (
        <g key={`h-${actif}`} className="dessin__hachures">
          {zones(pieceActive).map(([a, b], i) => {
            const [x0, y0] = d.P(a), [x1, y1] = d.P(b);
            return (
              <rect key={i} x={Math.min(x0, x1)} y={Math.min(y0, y1)} width={Math.abs(x1 - x0)} height={Math.abs(y1 - y0)}
                fill={`url(#hachures-${id})`} />
            );
          })}
        </g>
      )}

      {/* Zones de survol (invisibles) */}
      {listePieces.map(([cle, p]) =>
        zones(p).map(([a, b], i) => {
          const [x0, y0] = d.P(a), [x1, y1] = d.P(b);
          const marge = 6;
          return (
            <rect
              key={`${cle}-${i}`}
              className="dessin__zone"
              x={Math.min(x0, x1) - marge}
              y={Math.min(y0, y1) - marge}
              width={Math.abs(x1 - x0) + marge * 2}
              height={Math.abs(y1 - y0) + marge * 2}
              onPointerEnter={() => setActif(cle)}
              onClick={() => setActif((v) => (v === cle ? null : cle))}
            />
          );
        })
      )}

      {grain && <rect className="dessin__grain" x="-40" y="-40" width={d.largeur + 80} height={d.hauteur + 80} fill={`url(#grain-${id})`} />}

      {pieceActive && <Repere key={actif} piece={pieceActive} P={d.P} />}
    </svg>
  );
}

function zones(p) {
  if (!p.zone) return [];
  return Array.isArray(p.zone[0][0]) ? p.zone : [p.zone];
}
