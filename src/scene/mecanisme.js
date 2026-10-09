import * as THREE from 'three';
import { TubeCorde, CordeVerlet } from './corde.js';

// Pilotage du portique : chariot (← →), palan (↑ ↓), cordes, poulies et balancement de la charge.
// Tout est en mètres et en secondes. Repère Three.js : Y vers le haut, X le long de la poutre.

const G = 9.81;
const VITESSE_CHARIOT = 0.12; // m/s
const VITESSE_LEVAGE = 0.06;  // m/s (la charge ; la corde, elle, défile 5 fois plus vite)
const ACCEL_MAX = 0.6;        // m/s², démarrages et arrêts progressifs
const BRINS = 5;
const RAYON_CORDE = 0.001;
const RESTE_MINI = 0.72;      // brin libre quand la charge est au sol : de la poulie jusqu'au sol en passant sur le seau

// Commandes : clavier ou boutons tactiles. Un seul portique à la fois en est « propriétaire »
// (celui dont la section est à l'écran) : les autres ignorent les touches.
export const touches = { gauche: false, droite: false, haut: false, bas: false };
export const clavier = { proprietaire: null };
const AUCUNE = { gauche: false, droite: false, haut: false, bas: false };

export function prendreCommandes(id) {
  if (clavier.proprietaire !== id) for (const k in touches) touches[k] = false;
  clavier.proprietaire = id;
}
export function rendreCommandes(id) {
  if (clavier.proprietaire !== id) return;
  clavier.proprietaire = null;
  for (const k in touches) touches[k] = false;
}
export function commandesDe(id) {
  return clavier.proprietaire === id ? touches : AUCUNE;
}

// Portiques pilotables présents sur la page, avec l'élément qui contient leur vue 3D
const pilotes = new Map();
export function inscrirePilote(id, element) {
  pilotes.set(id, element);
  return () => { if (pilotes.get(id) === element) pilotes.delete(id); };
}
// Secours : si personne n'a la main, le portique le plus visible à l'écran la prend
function piloteVisible() {
  let meilleur = null, part = 0.4;
  for (const [id, el] of pilotes) {
    const r = el.getBoundingClientRect();
    const visible = Math.max(0, Math.min(r.bottom, innerHeight) - Math.max(r.top, 0));
    const p = visible / Math.min(r.height || 1, innerHeight);
    if (p > part) { part = p; meilleur = id; }
  }
  return meilleur;
}
const CODES = { ArrowLeft: 'gauche', ArrowRight: 'droite', ArrowUp: 'haut', ArrowDown: 'bas' };
window.addEventListener('keydown', (e) => {
  if (!CODES[e.code]) return;
  if (!clavier.proprietaire) {
    const id = piloteVisible();
    if (!id) return;
    prendreCommandes(id);
  }
  touches[CODES[e.code]] = true;
  e.preventDefault(); // les flèches pilotent la grue au lieu de faire défiler la page
});
window.addEventListener('keyup', (e) => {
  if (CODES[e.code]) touches[CODES[e.code]] = false;
});
window.addEventListener('blur', () => { for (const k in touches) touches[k] = false; });

export function approche(v, cible, pasMax) {
  return v + THREE.MathUtils.clamp(cible - v, -pasMax, pasMax);
}

export function monde(obj) {
  return obj.getWorldPosition(new THREE.Vector3());
}

// Points d'un demi-tour de corde autour d'une poulie (dans le plan XY de la poulie)
export function arc(centre, r, a0, a1, n, sortie, debut) {
  for (let i = 0; i < n; i++) {
    const a = a0 + ((a1 - a0) * i) / (n - 1);
    sortie[debut + i].set(centre.x + r * Math.cos(a), centre.y + r * Math.sin(a), centre.z);
  }
  return debut + n;
}

// piloter = false : rien n'est déplacé (montage), les cordes suivent simplement les pièces
export function creerMecanisme(model, scene, { piloter = true, id = 'maquette' } = {}) {
  const o = (n) => model.getObjectByName(n);
  const chariot = o('Chariot');
  const moufle = o('Moufle');
  const pHaut = [o('Poulie_haut_1'), o('Poulie_haut_2'), o('Poulie_haut_3')];
  const pBas = [o('Poulie_bas_1'), o('Poulie_bas_2')];
  const renvoi = { G: o('Poulie_renvoi_G'), D: o('Poulie_renvoi_D') };
  const poigneeT = { G: o('Poignee_translation_G'), D: o('Poignee_translation_D') };
  const ancreT = { G: o('Ancre_translation_G'), D: o('Ancre_translation_D') };
  const ancreFixe = o('Ancre_levage_fixe');
  const poigneeLevage = o('Poignee_levage');
  const charge = o('Charge');

  const rP = pHaut[0].userData.rayon_gorge;
  const rR = renvoi.G.userData.rayon_gorge;
  const limC = chariot.userData;
  const limM = moufle.userData;

  model.updateMatrixWorld(true);

  const etat = {
    x: 0, vx: 0, ax: 0,       // chariot
    levee: 0, vl: 0,          // palan, par rapport à la position de repos
    theta: 0, omega: 0,       // balancement du moufle et de la charge
  };
  const xRepos = chariot.position.x;
  const moufleRepos = moufle.position.clone();
  const pivot = pHaut[1].position.clone(); // axe des poulies du haut, repère du chariot

  const mat = new THREE.MeshStandardMaterial({ color: 0xe9e1cf, roughness: 0.95 });
  const matT = mat.clone();
  const parentPoignee = poigneeLevage.parent;
  const reposPoignee = { pos: poigneeLevage.position.clone(), rot: poigneeLevage.rotation.clone() };

  // --- Cordes de translation (tendues : géométrie pure, longueur constante) ---
  const NA = 8;
  const transl = {};
  for (const cote of ['G', 'D']) {
    const c = monde(renvoi[cote]);
    const ext = cote === 'G' ? Math.PI : 0;          // côté extérieur de la poulie
    const pts = Array.from({ length: NA + 2 }, () => new THREE.Vector3());
    const tube = new TubeCorde(pts.length, RAYON_CORDE, matT);
    scene.add(tube);
    const horiz0 = monde(ancreT[cote]).distanceTo(new THREE.Vector3(c.x, c.y + rR, c.z));
    transl[cote] = { c, ext, pts, tube, horiz0, y0: poigneeT[cote].position.y, angle0: renvoi[cote].rotation.z };
  }

  // --- Palan : 5 brins tendus entre les poulies + brin libre côté opérateur ---
  const NP = 7;
  const ptsPalan = Array.from({ length: 1 + NP * 5 }, () => new THREE.Vector3());
  const tubePalan = new TubeCorde(ptsPalan.length, RAYON_CORDE, mat);
  scene.add(tubePalan);

  // Brin libre : il pend de la dernière poulie du haut, la poignée au bout
  scene.attach(poigneeLevage); // la poignée n'est plus portée par le chariot, c'est la corde qui la tient
  const sortie = ptsPalan[ptsPalan.length - 1];
  const longueurReste = () => RESTE_MINI + BRINS * (etat.levee - limM.min);
  const SEG_RESTE = 0.02;
  const maxReste = Math.ceil((RESTE_MINI + BRINS * (limM.max - limM.min)) / SEG_RESTE) + 2;
  const reste = new CordeVerlet(maxReste, SEG_RESTE, longueurReste(), new THREE.Vector3());
  const tubeReste = new TubeCorde(maxReste, RAYON_CORDE, mat);
  scene.add(tubeReste);

  const anglesPoulies = { haut: pHaut.map((p) => p.rotation.z), bas: pBas.map((p) => p.rotation.z) };

  function physique(dt) {
    const touches = commandesDe(id);
    // Chariot
    const dirX = (touches.droite ? 1 : 0) - (touches.gauche ? 1 : 0);
    const vAvant = etat.vx;
    etat.vx = approche(etat.vx, dirX * VITESSE_CHARIOT, ACCEL_MAX * dt);
    etat.x += etat.vx * dt;
    if (etat.x < limC.min || etat.x > limC.max) {
      etat.x = THREE.MathUtils.clamp(etat.x, limC.min, limC.max);
      etat.vx = 0; // butée : arrêt sec, la charge part en balancier
    }
    etat.ax = (etat.vx - vAvant) / dt;

    // Palan
    const dirL = (touches.haut ? 1 : 0) - (touches.bas ? 1 : 0);
    etat.vl = approche(etat.vl, dirL * VITESSE_LEVAGE, ACCEL_MAX * dt);
    etat.levee += etat.vl * dt;
    if (etat.levee < limM.min || etat.levee > limM.max) {
      etat.levee = THREE.MathUtils.clamp(etat.levee, limM.min, limM.max);
      etat.vl = 0;
    }

    // Pendule : la charge pend sous les poulies du haut, longueur = jusqu'au centre du seau
    const d = moufleRepos.y + etat.levee - pivot.y;           // négatif
    const L = -d + 0.15;
    const posee = etat.levee <= limM.min + 1e-4;               // seau au sol : pas de balancement
    if (posee) {
      etat.theta = Math.abs(etat.theta) < 1e-5 ? 0 : etat.theta * 0.8;
      etat.omega = 0;
    }
    else {
      etat.omega += (-(G / L) * Math.sin(etat.theta) - (etat.ax / L) * Math.cos(etat.theta)) * dt;
      etat.omega *= Math.exp(-0.5 * dt);
      etat.theta += etat.omega * dt;
    }
  }

  function appliquer() {
    if (piloter) {
      chariot.position.x = xRepos + etat.x;
      const d = moufleRepos.y + etat.levee - pivot.y;
      moufle.position.set(pivot.x - d * Math.sin(etat.theta), pivot.y + d * Math.cos(etat.theta), moufleRepos.z);
      moufle.rotation.z = etat.theta;

      // Poulies du palan : le brin n° k défile à k fois la vitesse de levée
      pHaut.forEach((p, i) => { p.rotation.z = anglesPoulies.haut[i] - ((2 * i + 1) * etat.levee) / rP; });
      pBas.forEach((p, i) => { p.rotation.z = anglesPoulies.bas[i] + ((2 * i + 2) * etat.levee) / rP; });
    }
    model.updateMatrixWorld(true);

    // Cordes de translation : ce que la partie horizontale gagne, la partie verticale le perd
    for (const cote of ['G', 'D']) {
      const t = transl[cote];
      // la poulie de renvoi peut bouger (montage) : on suit sa position réelle
      renvoi[cote].getWorldPosition(t.c);
      const a = monde(ancreT[cote]);
      const haut = new THREE.Vector3(t.c.x, t.c.y + rR, t.c.z);
      const horiz = a.distanceTo(haut);
      const delta = horiz - t.horiz0;
      if (piloter) {
        poigneeT[cote].position.y = t.y0 + delta;
        renvoi[cote].rotation.z = t.angle0 + (cote === 'G' ? 1 : -1) * delta / rR;
        poigneeT[cote].updateMatrixWorld(true);
      }
      t.pts[0].copy(a);
      arc(t.c, rR, Math.PI / 2, t.ext, NA, t.pts, 1);
      t.pts[NA + 1].copy(monde(poigneeT[cote].children[0] ?? poigneeT[cote]));
      t.tube.maj(t.pts);
    }

    // Palan : brin mort → haut 1 → bas 1 → haut 2 → bas 2 → haut 3 → main de l'opérateur
    const h = pHaut.map(monde), b = pBas.map(monde);
    let i = 0;
    ptsPalan[i++].copy(monde(ancreFixe));
    i = arc(h[0], rP, Math.PI, 0, NP, ptsPalan, i);
    i = arc(b[0], rP, 0, -Math.PI, NP, ptsPalan, i);
    i = arc(h[1], rP, Math.PI, 0, NP, ptsPalan, i);
    i = arc(b[1], rP, 0, -Math.PI, NP, ptsPalan, i);
    arc(h[2], rP, Math.PI, 0, NP, ptsPalan, i);
    tubePalan.maj(ptsPalan);
  }

  // Le brin libre ne traverse ni le moufle ni le seau (cylindres approchés)
  const obstacles = [{}, {}];
  function majObstacles() {
    const m = monde(moufle), c = monde(charge);
    Object.assign(obstacles[0], { x: m.x, z: m.z, r: 0.032, yBas: m.y - 0.036, yHaut: m.y + 0.018 });
    Object.assign(obstacles[1], { x: c.x, z: c.z, r: 0.081, yBas: c.y - 0.232, yHaut: c.y - 0.027 });
    return obstacles;
  }

  // Position de départ : la corde passe sur le bord du seau côté avant, descend, puis s'étale au sol
  function replacerReste() {
    appliquer();
    const ob = majObstacles()[1];
    const bord = new THREE.Vector3(ob.x + 0.04, ob.yHaut + 0.005, ob.z + 0.075);
    reste.initChemin([
      sortie.clone(),
      bord,
      new THREE.Vector3(bord.x, RAYON_CORDE, bord.z + 0.01),
      new THREE.Vector3(bord.x, RAYON_CORDE, bord.z + 3),
    ]);
    for (let k = 0; k < 480; k++) reste.pas(1 / 240, sortie, RAYON_CORDE, obstacles); // laisse la corde se poser
    tubeReste.maj(reste.points());
    poigneeLevage.position.copy(reste.p[reste.p.length - 1]);
  }
  replacerReste();

  return {
    etat,
    limites: { chariot: limC, moufle: limM },
    pieces: { chariot, moufle, poigneeT, poigneeLevage },
    cordes: { palan: [tubePalan, tubeReste], translation: [transl.G.tube, transl.D.tube] },    replacerReste,
    // Remet le modèle dans son état d'origine et retire les cordes de la scène
    detruire() {
      for (const t of [tubePalan, tubeReste, transl.G.tube, transl.D.tube]) {
        scene.remove(t);
        t.geometry.dispose();
      }
      mat.dispose();
      matT.dispose();
      parentPoignee.attach(poigneeLevage);
      poigneeLevage.position.copy(reposPoignee.pos);
      poigneeLevage.rotation.copy(reposPoignee.rot);
      if (piloter) {
        chariot.position.x = xRepos;
        moufle.position.copy(moufleRepos);
        moufle.rotation.z = 0;
        pHaut.forEach((p, i) => { p.rotation.z = anglesPoulies.haut[i]; });
        pBas.forEach((p, i) => { p.rotation.z = anglesPoulies.bas[i]; });
        for (const cote of ['G', 'D']) {
          poigneeT[cote].position.y = transl[cote].y0;
          renvoi[cote].rotation.z = transl[cote].angle0;
        }
      }
      if (clavier.proprietaire === id) for (const k in touches) touches[k] = false;
    },
    maj(dtFrame) {
      if (!(dtFrame > 0)) return;
      const dtTotal = Math.min(dtFrame, 1 / 20);
      const n = Math.max(1, Math.ceil(dtTotal / (1 / 240)));
      const dt = dtTotal / n;
      for (let k = 0; k < n; k++) {
        if (piloter) physique(dt);
        appliquer();
        reste.setLongueur(longueurReste());
        reste.pas(dt, sortie, RAYON_CORDE, majObstacles());
      }
      tubeReste.maj(reste.points());
      poigneeLevage.position.copy(reste.p[reste.p.length - 1]);
    },
  };
}
