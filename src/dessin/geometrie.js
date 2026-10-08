import rough from 'roughjs';

// Transforme une description de plan (en cm, Y vers le haut) en traits « crayon » (chemins SVG).
//
// Éléments acceptés :
//   { type: 'ligne', a: [x, y], b: [x, y] }
//   { type: 'rect', a: [x0, y0], b: [x1, y1] }             4 traits
//   { type: 'polyligne', points: [[x, y], ...] }
//   { type: 'cercle', c: [x, y], r }
//   { type: 'cote', a, b, sens: 'h' | 'v', decal, texte }   ligne de cote avec attaches et traits obliques
//   { type: 'encastrement', a: [x0, y], b: [x1, y] }        sol hachuré
//   { type: 'texte', p: [x, y], texte, taille, ancre, police, rotation }
// Propriétés communes : etape (ordre de tracé), piece (survol), couleur, epaisseur.

const gen = rough.generator();
const EPAISSEUR = 1.7; // les plans sont affichés réduits : on grossit le trait

const STYLE_TRAIT = { roughness: 0.9, bowing: 0.7, disableMultiStroke: false };
const STYLE_FIN = { roughness: 0.45, bowing: 0.3, disableMultiStroke: true };

export function preparerDessin(elements, cadre, k = 10) {
  const P = ([x, y]) => [(x - cadre.xmin) * k, (cadre.ymax - y) * k];
  const traits = [];
  const textes = [];
  let graine = 1;

  const ajouterLigne = (a, b, el, { fin = false, debord = !fin, epaisseur } = {}) => {
    let [x1, y1] = P(a), [x2, y2] = P(b);
    if (debord) {
      // le crayon dépasse un peu aux extrémités, comme un tracé à la règle
      const dx = x2 - x1, dy = y2 - y1, l = Math.hypot(dx, dy) || 1;
      const e1 = (0.15 + ((graine * 37) % 10) / 25) * k * 0.35, e2 = (0.15 + ((graine * 53) % 10) / 25) * k * 0.35;
      x1 -= (dx / l) * e1; y1 -= (dy / l) * e1;
      x2 += (dx / l) * e2; y2 += (dy / l) * e2;
    }
    const opts = {
      ...(fin ? STYLE_FIN : STYLE_TRAIT),
      seed: graine++,
      stroke: 'currentColor',
      strokeWidth: (epaisseur ?? el.epaisseur ?? (fin ? 0.9 : 1.6)) * EPAISSEUR,
    };
    pousser(gen.line(x1, y1, x2, y2, opts), el, fin);
  };

  const pousser = (drawable, el, fin) => {
    for (const p of gen.toPaths(drawable)) {
      if (p.stroke === 'none') continue;
      traits.push({
        d: p.d,
        etape: el.etape ?? 0,
        piece: el.piece ?? null,
        couleur: el.couleur ?? null,
        epaisseur: p.strokeWidth,
        fin,
      });
    }
  };

  for (const el of elements) {
    switch (el.type) {
      case 'ligne':
        ajouterLigne(el.a, el.b, el, { fin: el.fin });
        break;
      case 'polyligne':
        for (let i = 0; i < el.points.length - 1; i++) ajouterLigne(el.points[i], el.points[i + 1], el, { fin: el.fin });
        break;
      case 'rect': {
        const [x0, y0] = el.a, [x1, y1] = el.b;
        ajouterLigne([x0, y1], [x1, y1], el);
        ajouterLigne([x1, y1], [x1, y0], el);
        ajouterLigne([x1, y0], [x0, y0], el);
        ajouterLigne([x0, y0], [x0, y1], el);
        break;
      }
      case 'cercle': {
        const [cx, cy] = P(el.c);
        pousser(
          gen.circle(cx, cy, el.r * 2 * k, {
            ...STYLE_TRAIT, roughness: 0.6, seed: graine++, stroke: 'currentColor', strokeWidth: (el.epaisseur ?? 1.4) * EPAISSEUR,
          }),
          el, false
        );
        break;
      }
      case 'encastrement': {
        const [x0, y] = el.a, [x1] = el.b;
        ajouterLigne([x0, y], [x1, y], el);
        const pas = el.pas ?? 3;
        for (let x = x0 + 1; x <= x1 + 0.01; x += pas) ajouterLigne([x, y], [x + 3, y - 3], el, { fin: true, debord: false });
        break;
      }
      case 'cote': {
        const { a, b, sens, decal, texte } = el;
        const t = 1.2; // demi-longueur des traits obliques
        const ecart = 0.8, depasse = 1.2;
        if (sens === 'h') {
          const y = a[1] + decal, s = Math.sign(decal) || 1;
          if (el.attaches !== false) {
            ajouterLigne([a[0], a[1] + ecart * s], [a[0], y + depasse * s], el, { fin: true });
            ajouterLigne([b[0], b[1] + ecart * s], [b[0], y + depasse * s], el, { fin: true });
          }
          ajouterLigne([a[0] - 1.5, y], [b[0] + 1.5, y], el, { fin: true, debord: false });
          ajouterLigne([a[0] - t, y - t], [a[0] + t, y + t], el, { fin: true, debord: false, epaisseur: 1.3 });
          ajouterLigne([b[0] - t, y - t], [b[0] + t, y + t], el, { fin: true, debord: false, epaisseur: 1.3 });
          textes.push({ ...el, texte, p: [(a[0] + b[0]) / 2, y + 1.3], ancre: 'middle', taille: el.taille ?? 2.9, police: 'main', cote: true });
        } else {
          const x = a[0] + decal, s = Math.sign(decal) || 1;
          if (el.attaches !== false) {
            ajouterLigne([a[0] + ecart * s, a[1]], [x + depasse * s, a[1]], el, { fin: true });
            ajouterLigne([b[0] + ecart * s, b[1]], [x + depasse * s, b[1]], el, { fin: true });
          }
          ajouterLigne([x, a[1] - 1.5], [x, b[1] + 1.5], el, { fin: true, debord: false });
          ajouterLigne([x - t, a[1] - t], [x + t, a[1] + t], el, { fin: true, debord: false, epaisseur: 1.3 });
          ajouterLigne([x - t, b[1] - t], [x + t, b[1] + t], el, { fin: true, debord: false, epaisseur: 1.3 });
          textes.push({ ...el, texte, p: [x - 1.3, (a[1] + b[1]) / 2], ancre: 'middle', taille: el.taille ?? 2.9, police: 'main', rotation: -90, cote: true });
        }
        break;
      }
      case 'texte':
        textes.push(el);
        break;
      default:
        console.warn('élément de dessin inconnu', el);
    }
  }

  const textesPx = textes.map((t) => {
    const [x, y] = P(t.p);
    return { ...t, x, y, taillePx: (t.taille ?? 2.5) * k, etape: t.etape ?? 0 };
  });

  return {
    largeur: (cadre.xmax - cadre.xmin) * k,
    hauteur: (cadre.ymax - cadre.ymin) * k,
    traits,
    textes: textesPx,
    P,
    k,
  };
}
