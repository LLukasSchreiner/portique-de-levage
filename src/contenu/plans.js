// Plans du portique, en centimètres, Y vers le haut, origine au sol au centre.
// Cotes reprises des plans de l'équipe (vues de face, de côté et de coupe, indice A du 08/10/2026),
// disponibles en PDF dans public/plans/.

const ROUGE = 'var(--rouge)';
const BLEU = 'var(--bleu)';
const VERT = 'var(--vert)';
const JAUNE = '#b8962e';

// Hachures à 45° dans un rectangle (traits fins), comme les zones colorées des plans.
function hachures(a, b, pas, props) {
  const [x0, y0] = a, [x1, y1] = b, h = y1 - y0;
  const out = [];
  for (let c = x0 - h; c < x1; c += pas) {
    const t0 = Math.max(0, x0 - c), t1 = Math.min(h, x1 - c);
    if (t1 - t0 > 0.05) out.push({ type: 'ligne', a: [c + t0, y0 + t0], b: [c + t1, y0 + t1], fin: true, hachure: true, ...props });
  }
  return out;
}

// Contour arrondi du palan à chaîne et de sa fenêtre
const ovale = (cx, cy, rx, ry, n = 28) =>
  Array.from({ length: n + 1 }, (_, i) => [cx + rx * Math.cos((2 * Math.PI * i) / n), cy + ry * Math.sin((2 * Math.PI * i) / n)]);
const arcCrochet = Array.from({ length: 19 }, (_, i) => {
  const t = ((70 - (270 * i) / 18) * Math.PI) / 180;
  return [1.9 * Math.cos(t), 50.4 + 1.9 * Math.sin(t)];
});

// ---------- Vue de face ----------
// Pieds de 5 cm à 57 cm d'entraxe (52 cm entre faces), poutre de 62 cm au ras des pieds.

const piecesFace = [
  { type: 'ligne', a: [-46, 0], b: [42, 0], etape: 0, fin: true },
  // socles (3 couches de carton, 2 cm)
  { type: 'rect', a: [-33.5, 0], b: [-23.5, 2], etape: 1, piece: 'socle' },
  { type: 'rect', a: [23.5, 0], b: [33.5, 2], etape: 1, piece: 'socle' },
  // barre de maintien qui relie les deux socles
  { type: 'rect', a: [-33.5, 2], b: [33.5, 3.6], etape: 1, piece: 'barre', couleur: JAUNE, epaisseur: 1.2 },
  ...hachures([-33.5, 2], [33.5, 3.6], 1.1, { etape: 1, piece: 'barre', couleur: JAUNE }),
  // pieds
  { type: 'rect', a: [-31, 3.6], b: [-26, 70], etape: 2, piece: 'pied' },
  { type: 'rect', a: [26, 3.6], b: [31, 70], etape: 2, piece: 'pied' },
  // poutre et scotch
  { type: 'rect', a: [-31, 70], b: [31, 78], etape: 3, piece: 'poutre' },
  { type: 'ligne', a: [-31, 78.35], b: [31, 78.35], etape: 3, piece: 'scotch', couleur: BLEU, epaisseur: 1.3 },
  // glissière
  { type: 'rect', a: [-5, 69.4], b: [5, 78.6], etape: 4, piece: 'glissiere', couleur: VERT },
  ...hachures([-5, 69.4], [5, 78.6], 1.2, { etape: 4, piece: 'glissiere', couleur: VERT }),
  // piques à brochette
  { type: 'ligne', a: [-33, 3.6], b: [-31, 17], etape: 5, piece: 'tige', epaisseur: 1.1 },
  { type: 'ligne', a: [-24, 3.6], b: [-26, 17], etape: 5, piece: 'tige', epaisseur: 1.1 },
  { type: 'ligne', a: [24, 3.6], b: [26, 17], etape: 5, piece: 'tige', epaisseur: 1.1 },
  { type: 'ligne', a: [33, 3.6], b: [31, 17], etape: 5, piece: 'tige', epaisseur: 1.1 },
  // palan à chaîne
  { type: 'polyligne', points: [[-4.2, 69.4], [4.2, 69.4], [5, 68.6], [5, 62.6], [0, 59.4], [-5, 62.6], [-5, 68.6], [-4.2, 69.4]], etape: 6, piece: 'palan' },
  { type: 'polyligne', points: ovale(0, 65.3, 4, 2.4), etape: 6, piece: 'palan', epaisseur: 1.2 },
  { type: 'polyligne', points: ovale(0, 65.3, 3.3, 1.8), etape: 6, piece: 'palan', fin: true },
  { type: 'cercle', c: [1.6, 68.2], r: 0.45, etape: 6, piece: 'palan', epaisseur: 1 },
  { type: 'ligne', a: [0, 59.4], b: [0, 53.9], etape: 6, piece: 'palan', epaisseur: 1 },
  // crochet de levage
  { type: 'rect', a: [-0.8, 52.7], b: [0.8, 53.9], etape: 7, piece: 'crochet', epaisseur: 1.1 },
  { type: 'polyligne', points: [[0.3, 52.7], [0.65, 52.2], ...arcCrochet], etape: 7, piece: 'crochet', epaisseur: 1.3 },
];

const cotesFace = [
  { type: 'cote', sens: 'h', a: [-31, 78.6], b: [31, 78.6], decal: 9, texte: '62', etape: 8 },
  { type: 'cote', sens: 'h', a: [-5, 78.6], b: [5, 78.6], decal: 4.4, texte: '10', etape: 8 },
  { type: 'cote', sens: 'v', a: [31, 70], b: [31, 78], decal: 6, texte: '8', etape: 8 },
  { type: 'cote', sens: 'h', a: [-26, 45], b: [26, 45], decal: 0, texte: '52', etape: 9, attaches: false },
  { type: 'cote', sens: 'h', a: [26, 35], b: [31, 35], decal: 0, texte: '5', etape: 9, attaches: false },
];

export const planFace = {
  cadre: { xmin: -50, xmax: 74, ymin: -6, ymax: 92 },
  elements: [...piecesFace, ...cotesFace],
  pieces: {
    scotch: { nom: 'Scotch', repere: 1, detail: 'SUR LE DESSUS DE LA POUTRE', hachures: false, zone: [[-31, 78], [31, 78.7]], ancre: [-20, 78.35], etiquette: [46, 88] },
    glissiere: { nom: 'Glissière', repere: 2, detail: '10 CM · COULISSE', hachures: false, zone: [[-5, 69.4], [5, 78.6]], ancre: [5, 76], etiquette: [46, 79] },
    poutre: { nom: 'Poutre', repere: 3, detail: '62 × 8 CM', zone: [[-31, 70], [31, 78]], ancre: [22, 74], etiquette: [46, 70] },
    palan: { nom: 'Palan', repere: 4, detail: 'ACCROCHÉ SOUS LA GLISSIÈRE', hachures: false, zone: [[-5, 59.4], [5, 69.4]], ancre: [5, 65], etiquette: [46, 61] },
    crochet: { nom: 'Crochet de levage', repere: 5, detail: 'REÇOIT LA CHARGE', hachures: false, zone: [[-2, 48.5], [2, 53.9]], ancre: [1.9, 50.4], etiquette: [46, 52] },
    pied: { nom: 'Pieds', repere: 6, detail: '×2 · 5 CM DE LARGE', zone: [[[-31, 3.6], [-26, 70]], [[26, 3.6], [31, 70]]], ancre: [31, 30], etiquette: [46, 34] },
    tige: {
      nom: 'Piques à brochette', repere: 7, detail: 'MAINTIENNENT LES PIEDS', hachures: false,
      zone: [[[-33.5, 3.6], [-23.5, 17]], [[23.5, 3.6], [33.5, 17]]], ancre: [32, 10.3], etiquette: [46, 22],
    },
    barre: { nom: 'Barre de maintien', repere: 8, detail: 'RELIE LES DEUX SOCLES', hachures: false, zone: [[-33.5, 2], [33.5, 3.6]], ancre: [33.5, 2.8], etiquette: [46, 12] },
    socle: { nom: 'Socles', repere: 9, detail: '3 COUCHES DE CARTON · 2 CM', zone: [[[-33.5, 0], [-23.5, 2]], [[23.5, 0], [33.5, 2]]], ancre: [33.5, 1], etiquette: [46, 3] },
  },
};

// Silhouette sans cotes, pour l'accueil
export const silhouette = {
  cadre: { xmin: -40, xmax: 40, ymin: -3, ymax: 82 },
  elements: piecesFace.filter((e) => e.type !== 'texte' && !e.hachure).map((e) => (e.etape === 0 ? { ...e, a: [-38, 0], b: [38, 0] } : e)),
};

// ---------- Vues de côté et de coupe ----------
// Pied de 7 cm dans ce sens, socle de 25 cm, glissière de 9,2 cm de haut,
// deux piques à brochette espacées de 3 cm sous la glissière.

function vueLaterale(coupe) {
  const elements = [
    { type: 'ligne', a: [-18, 0], b: [18, 0], etape: 0, fin: true },
    { type: 'rect', a: [-12.5, 0], b: [12.5, 2], etape: 1, piece: 'socle' },
    { type: 'rect', a: [9, 2], b: [11, 3.6], etape: 1, piece: 'barre', couleur: JAUNE, epaisseur: 1.1 },
    ...hachures([9, 2], [11, 3.6], 0.7, { etape: 1, piece: 'barre', couleur: JAUNE }),
    { type: 'rect', a: [-3.5, 2], b: [3.5, 69.4], etape: 2, piece: 'pied' },
    { type: 'rect', a: [-3.5, 69.4], b: [3.5, 78.6], etape: 3, piece: 'glissiere', couleur: VERT },
    { type: 'ligne', a: [-3.5, 78.25], b: [3.5, 78.25], etape: 3, piece: 'scotch', couleur: BLEU, epaisseur: 1.3 },
    { type: 'rect', a: [-1.75, 67.4], b: [-1.25, coupe ? 71.4 : 69.4], etape: 4, piece: 'pique', epaisseur: 1 },
    { type: 'rect', a: [1.25, 67.4], b: [1.75, coupe ? 71.4 : 69.4], etape: 4, piece: 'pique', epaisseur: 1 },
    { type: 'ligne', a: [-12.2, 2], b: [-3.5, 16.6], etape: 5, piece: 'tige', epaisseur: 1.1 },
    { type: 'ligne', a: [12.2, 2], b: [3.5, 16.6], etape: 5, piece: 'tige', epaisseur: 1.1 },
    { type: 'cote', sens: 'v', a: [3.5, 69.4], b: [3.5, 78.6], decal: 7, texte: '9,2', etape: 8 },
    { type: 'cote', sens: 'h', a: [-1.5, 67.4], b: [1.5, 67.4], decal: -6, texte: '3', etape: 8 },
    { type: 'cote', sens: 'h', a: [-3.5, 40], b: [3.5, 40], decal: 0, texte: '7', etape: 9, attaches: false },
    { type: 'cote', sens: 'h', a: [-12.5, 0], b: [12.5, 0], decal: -5, texte: '25', etape: 9 },
  ];
  if (coupe) {
    elements.push(
      // 3 couches de carton du socle
      { type: 'ligne', a: [-12.5, 0.67], b: [12.5, 0.67], etape: 1, piece: 'socle', fin: true },
      { type: 'ligne', a: [-12.5, 1.33], b: [12.5, 1.33], etape: 1, piece: 'socle', fin: true },
      // pied encastré de 1,5 cm dans le socle
      { type: 'ligne', a: [-3.5, 2], b: [-3.5, 0.5], etape: 2, piece: 'encastrement', epaisseur: 1.2 },
      { type: 'ligne', a: [3.5, 2], b: [3.5, 0.5], etape: 2, piece: 'encastrement', epaisseur: 1.2 },
      { type: 'ligne', a: [-3.5, 0.5], b: [3.5, 0.5], etape: 2, piece: 'encastrement', fin: true },
    );
  }

  const pieces = {
    scotch: { nom: 'Scotch', repere: 1, detail: 'SUR LE DESSUS', hachures: false, zone: [[-3.5, 78], [3.5, 78.6]], ancre: [2, 78.25], etiquette: [20, 88] },
    glissiere: { nom: 'Glissière', repere: 2, detail: '9,2 CM DE HAUT', hachures: false, zone: [[-3.5, 69.4], [3.5, 78.6]], ancre: [3.5, 74], etiquette: [20, 78] },
    pique: { nom: 'Piques à brochette', repere: 7, detail: 'ESPACÉES DE 3 CM', hachures: false, zone: [[-1.75, 67.4], [1.75, coupe ? 71.4 : 69.4]], ancre: [1.75, 68.3], etiquette: [20, 66] },
    pied: { nom: 'Pied', repere: 6, detail: '7 CM DANS CE SENS', zone: [[-3.5, 2], [3.5, 69.4]], ancre: [3.5, 45], etiquette: [20, 48] },
    tige: { nom: 'Piques à brochette', repere: 7, detail: 'DU BORD DU SOCLE AU PIED', hachures: false, zone: [[-12.2, 2], [12.2, 16.6]], ancre: [8, 9.3], etiquette: [20, 30] },
    barre: { nom: 'Barre de maintien', repere: 8, detail: 'RELIE LES DEUX SOCLES', hachures: false, zone: [[9, 2], [11, 3.6]], ancre: [11, 2.8], etiquette: [20, 19] },
    socle: { nom: 'Socle', repere: 9, detail: coupe ? '3 COUCHES DE CARTON · E = 2 CM' : '25 CM : LE SENS STABLE', zone: [[-12.5, 0], [12.5, 2]], ancre: [12.5, 1], etiquette: [20, 8] },
  };
  if (coupe) {
    pieces.encastrement = {
      nom: 'Encastrement', repere: 10, detail: 'PIED ENFONCÉ DE 1,5 CM', hachures: false,
      zone: [[-3.5, 0.5], [3.5, 2]], ancre: [-3.5, 1.2], etiquette: [-16, 12], cote: 'g',
    };
  }
  return { cadre: { xmin: coupe ? -40 : -22, xmax: 50, ymin: -10, ymax: 92 }, elements, pieces };
}

export const planCote = vueLaterale(false);
export const planCoupe = vueLaterale(true);

// ---------- Plan cinématique (d'après le schéma de l'équipe) ----------
// Coordonnées reprises du schéma (pixels / 10, Y retourné).

const y = (py) => 80 - py / 10;

export const planCinematique = {
  cadre: { xmin: 0, xmax: 142, ymin: 2, ymax: 80 },
  elements: [
    { type: 'polyligne', points: [[15.7, y(713)], [15.7, y(105)], [125, y(105)], [125, y(713)]], etape: 0, piece: 'bati', couleur: BLEU, epaisseur: 1.8 },
    { type: 'encastrement', a: [4, y(713)], b: [28, y(713)], etape: 1, piece: 'bati', couleur: BLEU, pas: 3.5 },
    { type: 'encastrement', a: [113.3, y(713)], b: [137.5, y(713)], etape: 1, piece: 'bati', couleur: BLEU, pas: 3.5 },
    { type: 'rect', a: [64.8, y(130)], b: [90, y(57)], etape: 2, piece: 'glissement', couleur: 'var(--vert)' },
    { type: 'texte', p: [91.5, y(30)], texte: 'Glissement', taille: 3, police: 'main', couleur: 'var(--vert)', etape: 2 },
    { type: 'ligne', a: [78.3, y(130)], b: [78.3, y(150)], etape: 3, piece: 'palan', couleur: BLEU },
    { type: 'cercle', c: [71.2, y(173)], r: 2.3, etape: 3, piece: 'palan', couleur: ROUGE },
    { type: 'cercle', c: [78.3, y(172)], r: 2.3, etape: 3, piece: 'palan', couleur: ROUGE },
    { type: 'cercle', c: [85.5, y(172)], r: 2.3, etape: 3, piece: 'palan', couleur: ROUGE },
    { type: 'cercle', c: [74.4, y(242)], r: 2.3, etape: 4, piece: 'palan', couleur: ROUGE },
    { type: 'cercle', c: [81.5, y(242)], r: 2.3, etape: 4, piece: 'palan', couleur: ROUGE },
    { type: 'ligne', a: [72.2, y(196)], b: [73.3, y(220)], etape: 4, piece: 'palan', couleur: ROUGE, epaisseur: 1.2 },
    { type: 'ligne', a: [75.4, y(220)], b: [77.3, y(194)], etape: 4, piece: 'palan', couleur: ROUGE, epaisseur: 1.2 },
    { type: 'ligne', a: [79.6, y(194)], b: [80.6, y(220)], etape: 4, piece: 'palan', couleur: ROUGE, epaisseur: 1.2 },
    { type: 'ligne', a: [82.6, y(220)], b: [85, y(195)], etape: 4, piece: 'palan', couleur: ROUGE, epaisseur: 1.2 },
    { type: 'ligne', a: [85.5, y(195)], b: [85.5, y(315)], etape: 4, piece: 'palan', couleur: ROUGE, epaisseur: 1.2 },
    { type: 'texte', p: [89.5, y(255)], texte: 'Palan', taille: 3, police: 'main', couleur: ROUGE, etape: 4 },
    { type: 'rect', a: [77, y(410)], b: [91.3, y(315)], etape: 5, piece: 'charge', couleur: '#2a8fc4' },
    { type: 'texte', p: [84.2, y(372)], texte: 'Charge', taille: 2.9, ancre: 'middle', police: 'main', couleur: '#2a8fc4', etape: 5 },
  ],
  pieces: {
    glissement: {
      nom: 'Liaison glissière', repere: 'A', detail: 'LE CHARIOT COULISSE SUR LA POUTRE',
      zone: [[64.8, y(130)], [90, y(57)]], ancre: [64.8, y(95)], etiquette: [52, y(230)], cote: 'g',
    },
    palan: {
      nom: 'Palan', repere: 'B', detail: '3 POULIES FIXES · 2 MOBILES', hachures: false,
      zone: [[68.9, y(266)], [87.8, y(150)]], ancre: [69, y(200)], etiquette: [52, y(330)], cote: 'g',
    },
    charge: {
      nom: 'Charge', repere: 'C', detail: '3 KG · LEVÉE 40 CM',
      zone: [[77, y(410)], [91.3, y(315)]], ancre: [77, y(380)], etiquette: [52, y(430)], cote: 'g',
    },
    bati: {
      nom: 'Bâti encastré', repere: 'D', detail: 'PIEDS COLLÉS AUX SOCLES', hachures: false,
      zone: [[[13.7, y(713)], [17.7, y(105)]], [[123, y(713)], [127, y(105)]]], ancre: [17.7, y(520)], etiquette: [26, y(600)],
    },
  },
};
