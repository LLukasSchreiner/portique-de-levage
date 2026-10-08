// Textes du site. Les cotes de la notice sont alignées sur le plan et le rapport
// (trou de 5 × 7 cm, 52 cm entre les pieds).

export const projet = {
  intro:
    "Une maquette de portique de levage, en carton, capable de soulever une charge de 3 kg, " +
    "de la monter de 40 cm et de la déplacer de 30 cm sur le côté. Une seule personne la manœuvre, " +
    "à la force des bras, grâce à un palan qui divise l'effort par cinq.",
  chiffres: [
    { valeur: '3', unite: 'kg', label: 'de charge à lever' },
    { valeur: '40', unite: 'cm', label: 'de levée' },
    { valeur: '30', unite: 'cm', label: 'de déplacement latéral' },
    { valeur: '1', unite: 'm²', label: 'de carton, pas plus' },
    { valeur: '1', unite: 'pers.', label: 'à la manœuvre' },
  ],
  materiel: [
    '1 m² de carton simple cannelure (3,5 mm)',
    '15 pics à brochette de 25 cm',
    '5 poulies Ø 25 mm et 5 poulies Ø 15 mm',
    '7 boulons M3 de 3 cm',
    'plus de 10 m de ficelle (jute 2,5 mm, coton 1,5 mm)',
    '2 plaques rigides de 9 × 12 cm, colle chaude',
  ],
};

export const principe = {
  texte:
    "Le portique est un bâti encastré au sol : deux pieds collés à leurs socles, reliés par une poutre. " +
    "Un chariot coulisse le long de la poutre (liaison glissière) et porte un palan à cinq brins : " +
    "trois poulies fixes en haut, deux poulies mobiles en bas. La charge est suspendue au bloc mobile.",
  legende: 'Survolez les éléments du schéma.',
};

export const notice = {
  fournis: '2 socles, 2 pieds, 1 poutre avec le chariot en place, 4 équerres, 8 tiges, le palan déjà monté.',
  etapes: [
    { titre: 'Socles', texte: "Poser les 2 socles à plat, côté long perpendiculaire à la poutre, à 57 cm d'axe en axe." },
    { titre: 'Pieds', texte: "Emboîter chaque pied dans le trou de 5 × 7 cm de son socle, jusqu'en butée. Vérifier qu'il est bien vertical, puis coller à la colle chaude." },
    { titre: 'Tiges', texte: 'Insérer les 4 tiges de chaque pied, du bord du socle jusqu\'au pied. Les coller aux deux bouts.' },
    { titre: 'Poutre', texte: "Emboîter la poutre sur le haut des deux pieds, chariot vers le bas, au niveau des renforts intérieurs. Vérifier l'écart de 52 cm entre les pieds, puis coller." },
    { titre: 'Équerres', texte: 'Coller les 4 équerres dans les angles entre les pieds et la poutre, 2 par côté, une sur chaque face.' },
    { titre: 'Palan', texte: 'Accrocher le support du haut sous le chariot. Accrocher la charge au crochet du bas.' },
    { titre: 'Cordes de translation', texte: 'Les faire passer en bout de poutre et les laisser pendre de chaque côté.' },
    { titre: 'Vérification', texte: 'Le chariot coulisse sur 30 cm, la charge monte de 40 cm, et le portique ne bascule pas quand on le pousse légèrement sur le côté.' },
  ],
};

export const calculs = {
  intro: "L'effort de l'opérateur, F = 49 N, est pris dans le tableau de choix ; il majore le poids de la charge (3 kg = 29,4 N).",
  lignes: [
    { nom: 'Effort par brin', formule: '29,4 N ÷ 5', resultat: '≈ 5,9 N', verdict: null },
    { nom: 'Effort tranchant', formule: 'V = F / 2', resultat: '24,5 N', verdict: null },
    { nom: 'Moment de flexion', formule: 'M = F · L / 4  (L = 0,57 m)', resultat: '6,98 N·m', verdict: null },
    { nom: 'Moment quadratique', formule: 'I = (b·h³ − bᵢ·hᵢ³) / 12', resultat: '9,44 × 10⁻⁷ m⁴', verdict: null },
    { nom: 'Contrainte dans la poutre', formule: 'σ = M · y / I', resultat: '0,30 MPa', verdict: '< 1,4 MPa : ça passe' },
    { nom: 'Basculement', formule: 'M_b = 2,9 × 0,74 ; M_s = 34,4 × 0,125', resultat: '2,2 < 4,3 N·m', verdict: 'stable' },
  ],
  carton: { utilise: 0.879, avecPertes: 0.967, disponible: 1 },
};

export const equipe = [
  { prenom: 'Emma', nom: 'Gerné' },
  { prenom: 'Hugo', nom: 'Bauer' },
  { prenom: 'Nicolas', nom: 'Buchholzer' },
  { prenom: 'Allessandro', nom: 'Neri' },
  { prenom: '', nom: 'Chahine' },
];

export const sections = [
  { id: 'accueil', titre: 'Portique de levage' },
  { id: 'projet', titre: 'Le projet' },
  { id: 'principe', titre: 'Le principe' },
  { id: 'plan', titre: 'Plan coté' },
  { id: 'montage', titre: 'Montage' },
  { id: 'dimensionnement', titre: 'Dimensionnement' },
  { id: 'essayer', titre: 'Essayer' },
  { id: 'equipe', titre: "L'équipe" },
  { id: 'reel', titre: "L'engin réel" },
];

// ---------- L'engin réel (échelle 1:1) ----------
// Positions en mètres, repère du site (Y vers le haut). « vue » = cadrage quand on choisit le repère.

export const reel = {
  accroche: 'De 3 kg à 300 kg.',
  intro:
    "La même machine, à l'échelle 1:1 : " +
    "le carton devient de l'acier, les ficelles des câbles, et le levage passe par un treuil.",
  points: [
    {
      id: 'rail', numero: 1, titre: 'Rail et galets',
      texte: "Un rail carré 50 × 40 mm est soudé sur la poutre HEA 300. Le chariot l'enjambe : deux galets Ø 160 à double boudin roulent dessus, quatre galets de guidage serrent l'aile de la poutre.",
      position: [0, 7.62, 0], suivre: 'Chariot_reel', vue: { camera: [1.7, 8.3, 2.3], cible: [0, 7.3, 0] },
    },
    {
      id: 'moufle', numero: 2, titre: 'Moufle à 5 brins',
      texte: "Trois réas fixes sous le chariot, deux réas sur le moufle mobile. Le câble acier Ø 12 porte la charge sur cinq brins : pour 300 kg (environ 2 940 N), chaque brin ne reprend qu'environ 590 N.",
      position: [0.3, 6.3, 0], suivre: 'Chariot_reel', vue: { camera: [2.2, 5.6, 3.2], cible: [0, 4.9, 0] },
    },
    {
      id: 'crochet', numero: 3, titre: 'Crochet et élingues',
      texte: "Crochet forgé avec linguet de sécurité, anneau de levage et quatre élingues acier fixées aux oreilles de la caisse de 300 kg.",
      position: [0.15, 2.75, 0], suivre: 'Moufle_reel', vue: { camera: [2.3, 2.6, 3.4], cible: [0, 1.9, 0] },
    },
    {
      id: 'treuil', numero: 4, titre: 'Treuil à manivelle',
      texte: "Même divisé par cinq, il faudrait tirer environ 60 kg en continu. Le brin libre passe donc par une poulie de déviation et s'enroule sur un tambour ; l'engrenage 56/14 divise encore l'effort par 4 : environ 60 N sur la manivelle. Le cliquet empêche la charge de redescendre si on lâche.",
      position: [2.45, 1.45, 0.25], vue: { camera: [4.6, 2.2, 3.0], cible: [2.6, 1.2, 0] },
    },
    {
      id: 'encastrement', numero: 5, titre: 'Encastrement',
      texte: "Poteau HEB 240 soudé sur une platine de 30 mm, avec quatre goussets et quatre tiges d'ancrage M24 noyées dans un massif en béton. Fini les socles collés et les tiges en pics.",
      position: [-2.85, 0.45, 0.3], vue: { camera: [-1.0, 1.5, 2.6], cible: [-2.85, 0.35, 0] },
    },
    {
      id: 'jambe', numero: 6, titre: 'Jambe de force',
      texte: "Un tube carré de 120 mm rigidifie l'angle entre le poteau et la poutre. Elle remplace les équerres en carton.",
      position: [-2.45, 6.65, 0.15], vue: { camera: [-0.6, 6.3, 3.4], cible: [-2.4, 6.5, 0] },
    },
    {
      id: 'butees', numero: 7, titre: 'Butées de fin de course',
      texte: "Deux butées à tampons caoutchouc arrêtent le chariot à ±1,75 m, avant les jambes de force : 3,5 m de course.",
      position: [2.26, 7.62, 0], vue: { camera: [3.7, 8.3, 2.0], cible: [2.2, 7.4, 0] },
    },
  ],
  comparatif: [
    { critere: 'Échelle', maquette: '1:10', reel: '1:1' },
    { critere: 'Hauteur', maquette: '78 cm', reel: '≈ 7,3 m' },
    { critere: 'Charge', maquette: '3 kg (un seau)', reel: '300 kg (caisse acier)' },
    { critere: 'Poutre', maquette: 'Tube carton 7 × 8 cm', reel: 'HEA 300, rail soudé dessus' },
    { critere: 'Pieds', maquette: 'Tubes carton, socles collés', reel: 'HEB 240 sur platines ancrées' },
    { critere: 'Chariot', maquette: 'Fourreau qui glisse', reel: 'Chariot à galets sur rail' },
    { critere: 'Levage', maquette: 'Ficelle tirée à la main', reel: 'Câble Ø 12 et treuil' },
    { critere: 'Course / levée', maquette: '38 cm / 37 cm', reel: '3,5 m / 3,5 m' },
  ],
};

// ---------- Pied de page ----------

export const credits = {
  ecole: 'Projet réalisé au CESI',
  annee: 2026,
  textures: [
    { nom: 'Green Metal Rust', auteur: 'Rob Tuytel' },
    { nom: 'Concrete Floor 01', auteur: 'Rob Tuytel' },
  ],
  polices: ['Big Shoulders', 'IBM Plex Sans et Mono', 'Architects Daughter'],
  outils: ['Blender', 'React', 'Vite', 'Three.js', 'React Three Fiber', 'GSAP', 'Lenis', 'Rough.js'],
};
