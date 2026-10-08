// Plans du portique, en centimètres, Y vers le haut, origine au sol au centre.
// Cotes reprises du plan « Portique de levage – plan (cotes en cm) ».

const ROUGE = 'var(--rouge)';
const BLEU = 'var(--bleu)';

// ---------- Vue de face ----------

const piecesFace = [
  { type: 'ligne', a: [-46, 0], b: [42, 0], etape: 0, fin: true },
  // socles
  { type: 'rect', a: [-33.5, 0], b: [-23.5, 1.2], etape: 1, piece: 'socle' },
  { type: 'rect', a: [23.5, 0], b: [33.5, 1.2], etape: 1, piece: 'socle' },
  // pieds
  { type: 'rect', a: [-31, 1.2], b: [-26, 70], etape: 2, piece: 'pied' },
  { type: 'rect', a: [26, 1.2], b: [31, 70], etape: 2, piece: 'pied' },
  // poutre et chariot
  { type: 'rect', a: [-32, 70], b: [32, 78], etape: 3, piece: 'poutre' },
  { type: 'rect', a: [-5, 69.4], b: [5, 78.6], etape: 4, piece: 'chariot' },
  // tiges de maintien
  { type: 'ligne', a: [-33.5, 1.2], b: [-31, 24], etape: 5, piece: 'tige', epaisseur: 1.1 },
  { type: 'ligne', a: [-23.5, 1.2], b: [-26, 24], etape: 5, piece: 'tige', epaisseur: 1.1 },
  { type: 'ligne', a: [23.5, 1.2], b: [26, 24], etape: 5, piece: 'tige', epaisseur: 1.1 },
  { type: 'ligne', a: [33.5, 1.2], b: [31, 24], etape: 5, piece: 'tige', epaisseur: 1.1 },
  // équerres
  { type: 'ligne', a: [-26, 57], b: [-13, 70], etape: 5, piece: 'equerre', epaisseur: 1.1 },
  { type: 'ligne', a: [26, 57], b: [13, 70], etape: 5, piece: 'equerre', epaisseur: 1.1 },
  // palan
  { type: 'rect', a: [-2.2, 64.6], b: [2.2, 69.4], etape: 6, piece: 'palan' },
  { type: 'cercle', c: [0, 67], r: 1.3, etape: 6, piece: 'palan' },
  { type: 'ligne', a: [-1.3, 64.6], b: [-1.3, 29], etape: 6, piece: 'palan', epaisseur: 1 },
  { type: 'ligne', a: [1.3, 64.6], b: [1.3, 29], etape: 6, piece: 'palan', epaisseur: 1 },
  { type: 'rect', a: [-2.2, 25], b: [2.2, 29], etape: 6, piece: 'palan' },
  { type: 'cercle', c: [0, 27], r: 1.3, etape: 6, piece: 'palan' },
  { type: 'ligne', a: [0, 25], b: [0, 20], etape: 6, piece: 'palan', epaisseur: 1 },
  // charge
  { type: 'rect', a: [-7.5, 0], b: [7.5, 20], etape: 7, piece: 'charge', epaisseur: 1.1 },
  { type: 'texte', p: [0, 11], texte: 'Charge', taille: 2.4, ancre: 'middle', police: 'main', etape: 7 },
  { type: 'texte', p: [0, 7.5], texte: '15 × 20', taille: 2, ancre: 'middle', police: 'main', etape: 7 },
];

const cotesFace = [
  { type: 'cote', sens: 'h', a: [-32, 78], b: [32, 78], decal: 9, texte: '64', etape: 8 },
  { type: 'cote', sens: 'h', a: [-5, 78.6], b: [5, 78.6], decal: 4.4, texte: '10', etape: 8 },
  { type: 'cote', sens: 'v', a: [32, 70], b: [32, 78], decal: 6, texte: '8', etape: 8 },
  { type: 'cote', sens: 'v', a: [-33.5, 0], b: [-32, 78], decal: -11, texte: '78', etape: 9 },
  { type: 'cote', sens: 'v', a: [-31, 0], b: [-31, 70], decal: -6, texte: '70', etape: 9 },
  { type: 'cote', sens: 'h', a: [-26, 45], b: [26, 45], decal: 0, texte: '52', etape: 10, attaches: false },
  { type: 'cote', sens: 'h', a: [-26, 52], b: [-13, 52], decal: 0, texte: '13', etape: 10, attaches: false },
  { type: 'cote', sens: 'h', a: [26, 35], b: [31, 35], decal: 0, texte: '5', etape: 10, attaches: false },
  { type: 'cote', sens: 'h', a: [23.5, 0], b: [33.5, 0], decal: -4, texte: '10', etape: 11 },
  { type: 'cote', sens: 'h', a: [-28.5, 0], b: [28.5, 0], decal: -9.5, texte: '57', etape: 11 },
];

export const planFace = {
  cadre: { xmin: -50, xmax: 74, ymin: -14, ymax: 92 },
  elements: [...piecesFace, ...cotesFace],
  pieces: {
    chariot: { nom: 'Chariot', repere: 1, detail: 'COULISSE SUR LA POUTRE · 10 CM', zone: [[-5, 69.4], [5, 78.6]], ancre: [4, 77], etiquette: [46, 86] },
    poutre: { nom: 'Poutre', repere: 2, detail: 'TUBE 7 × 8 · 64 CM · 3 RENFORTS', zone: [[-32, 70], [32, 78]], ancre: [22, 74], etiquette: [46, 75] },
    equerre: {
      nom: 'Équerres', repere: 3, detail: '×4 · 13 CM · UNE PAR FACE', hachures: false,
      zone: [[[-26, 57], [-13, 70]], [[13, 57], [26, 70]]], ancre: [19.5, 63.5], etiquette: [46, 64],
    },
    palan: { nom: 'Palan 5 brins', repere: 4, detail: '3 + 2 POULIES · EFFORT ÷ 5', hachures: false, zone: [[-2.2, 25], [2.2, 69.4]], ancre: [2.2, 47], etiquette: [46, 53] },
    pied: { nom: 'Pieds', repere: 5, detail: '×2 · TUBE 5 × 7 · 70 CM', zone: [[[-31, 1.2], [-26, 70]], [[26, 1.2], [31, 70]]], ancre: [31, 42], etiquette: [46, 42] },
    charge: { nom: 'Charge', repere: 6, detail: '3 KG · 15 × 20 CM', zone: [[-7.5, 0], [7.5, 20]], ancre: [7.5, 12], etiquette: [46, 31] },
    tige: {
      nom: 'Tiges de maintien', repere: 7, detail: '×8 · PICS À BROCHETTE', hachures: false,
      zone: [[[-33.5, 1.2], [-23.5, 24]], [[23.5, 1.2], [33.5, 24]]], ancre: [32.3, 12], etiquette: [46, 20],
    },
    socle: { nom: 'Socles', repere: 8, detail: '×2 · 25 × 10 · 3 ÉPAISSEURS', zone: [[[-33.5, 0], [-23.5, 1.2]], [[23.5, 0], [33.5, 1.2]]], ancre: [33.5, 0.6], etiquette: [46, 9] },
  },
};

// Silhouette sans cotes, pour l'accueil
export const silhouette = {
  cadre: { xmin: -40, xmax: 40, ymin: -3, ymax: 82 },
  elements: piecesFace.filter((e) => e.type !== 'texte').map((e) => (e.etape === 0 ? { ...e, a: [-38, 0], b: [38, 0] } : e)),
};

// ---------- Vue de côté ----------

export const planCote = {
  cadre: { xmin: -22, xmax: 44, ymin: -10, ymax: 92 },
  elements: [
    { type: 'ligne', a: [-18, 0], b: [18, 0], etape: 0, fin: true },
    { type: 'rect', a: [-12.5, 0], b: [12.5, 1.2], etape: 1, piece: 'socle' },
    { type: 'rect', a: [-3.5, 1.2], b: [3.5, 70], etape: 2, piece: 'pied' },
    { type: 'rect', a: [-3.5, 70], b: [3.5, 78], etape: 3, piece: 'poutre' },
    { type: 'rect', a: [-3.9, 69.4], b: [3.9, 78.6], etape: 4, piece: 'chariot', epaisseur: 1.1 },
    { type: 'rect', a: [-2.2, 64.6], b: [-1.5, 69.4], etape: 6, piece: 'palan', epaisseur: 1.1 },
    { type: 'rect', a: [1.5, 64.6], b: [2.2, 69.4], etape: 6, piece: 'palan', epaisseur: 1.1 },
    { type: 'ligne', a: [-12.5, 1.2], b: [-3.5, 24], etape: 5, piece: 'tige', epaisseur: 1.1 },
    { type: 'ligne', a: [12.5, 1.2], b: [3.5, 24], etape: 5, piece: 'tige', epaisseur: 1.1 },
    { type: 'cote', sens: 'h', a: [-3.5, 78.6], b: [3.5, 78.6], decal: 6, texte: '7', etape: 8 },
    { type: 'cote', sens: 'v', a: [3.9, 69.4], b: [3.9, 78.6], decal: 7, texte: '9,2', etape: 8 },
    { type: 'cote', sens: 'h', a: [-1.5, 61.5], b: [1.5, 61.5], decal: 0, texte: '3', etape: 9, attaches: false },
    { type: 'cote', sens: 'h', a: [-3.5, 40], b: [3.5, 40], decal: 0, texte: '7', etape: 9, attaches: false },
    { type: 'cote', sens: 'h', a: [-12.5, 0], b: [12.5, 0], decal: -5, texte: '25', etape: 10 },
  ],
  pieces: {
    chariot: { nom: 'Chariot', repere: 1, detail: 'INTÉRIEUR 7,6 × 8,6', zone: [[-3.9, 69.4], [3.9, 78.6]], ancre: [3.9, 76], etiquette: [20, 86] },
    palan: { nom: 'Supports', repere: 4, detail: '2 × DOUBLÉS · ESPACÉS DE 3', hachures: false, zone: [[-2.2, 64.6], [2.2, 69.4]], ancre: [2.2, 66], etiquette: [20, 60] },
    pied: { nom: 'Pied', repere: 5, detail: '7 CM DANS CE SENS', zone: [[-3.5, 1.2], [3.5, 70]], ancre: [3.5, 45], etiquette: [20, 45] },
    tige: { nom: 'Tiges', repere: 7, detail: 'DU BORD DU SOCLE AU PIED', hachures: false, zone: [[-12.5, 1.2], [12.5, 24]], ancre: [8, 12.6], etiquette: [20, 28] },
    socle: { nom: 'Socle', repere: 8, detail: '25 CM : LE SENS STABLE', zone: [[-12.5, 0], [12.5, 1.2]], ancre: [12.5, 0.6], etiquette: [20, 10] },
  },
};

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
