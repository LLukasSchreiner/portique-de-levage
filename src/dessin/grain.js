// Grain de graphite : une tuile de mouchetures couleur papier, posée par-dessus les traits.
// Sur le papier elles sont invisibles ; sur un trait, elles le « trouent » comme un crayon.
// (Bien plus léger qu'un masque ou un filtre SVG recalculé à chaque image.)

const cache = new Map();

export function tuileGrain(papier = '#eceee7', taille = 160, densite = 0.2) {
  const cle = `${papier}|${taille}|${densite}`;
  if (cache.has(cle)) return cache.get(cle);
  const c = document.createElement('canvas');
  c.width = c.height = taille;
  const ctx = c.getContext('2d');
  ctx.fillStyle = papier;
  const img = ctx.createImageData(taille, taille);
  const [r, g, b] = couleur(papier);
  let s = 12345;
  const alea = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < taille * taille; i++) {
    const t = alea();
    img.data[i * 4] = r; img.data[i * 4 + 1] = g; img.data[i * 4 + 2] = b;
    img.data[i * 4 + 3] = t < densite ? 140 + (t / densite) * 115 : 0;
  }
  ctx.putImageData(img, 0, 0);
  const url = c.toDataURL('image/png');
  cache.set(cle, url);
  return url;
}

function couleur(hex) {
  const n = parseInt(hex.replace('#', ''), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
