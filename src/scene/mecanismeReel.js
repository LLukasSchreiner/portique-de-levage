import * as THREE from 'three';
import { TubeCorde } from './corde.js';
import { approche, arc, monde, commandesDe, clavier, touches } from './mecanisme.js';

// Pilotage du portique réel (échelle 1:1, en mètres). Même principe que la maquette,
// mais le brin libre ne pend plus : il passe par une poulie de déviation et s'enroule sur
// le tambour du treuil. Tout le câble reste donc tendu, sans simulation de corde molle.

const G = 9.81;
const VITESSE_CHARIOT = 0.5;   // m/s
const VITESSE_LEVAGE = 0.3;    // m/s
const ACCEL_MAX = 1.5;         // m/s²
const BRINS = 5;
const RAYON_LEVAGE = 0.006;    // câble Ø 12
const RAYON_TRANSLATION = 0.005;
const HAUSSE_POIGNEES = 0.85;  // les poignées de translation pendent plus haut pour rester au-dessus du sol en butée
const R_TAMBOUR = 0.096;
const SPIRES = 4;
const CENTRE_GRAVITE = 1.85;   // distance du moufle au centre de la caisse

// Point de contact d'un câble venant de « p » qui passe par-dessus une poulie (sens horaire)
function angleTangent(centre, r, p) {
  const dx = p.x - centre.x, dy = p.y - centre.y;
  const d = Math.max(Math.hypot(dx, dy), r * 1.001);
  return Math.atan2(dy, dx) - Math.acos(r / d);
}

export function creerMecanismeReel(model, scene, { id = 'reel' } = {}) {
  const o = (n) => model.getObjectByName(n);
  const chariot = o('Chariot_reel');
  const moufle = o('Moufle_reel');
  const reasHaut = [o('R_Rea_haut_1'), o('R_Rea_haut_2'), o('R_Rea_haut_3')];
  const reasBas = [o('R_Rea_bas_1'), o('R_Rea_bas_2')];
  const deviation = o('R_Poulie_deviation');
  const renvoi = { G: o('R_Poulie_renvoi_G'), D: o('R_Poulie_renvoi_D') };
  const poignee = { G: o('Poignee_translation_G_reel'), D: o('Poignee_translation_D_reel') };
  const ancrePoignee = { G: o('Ancre_poignee_translation_G_reel'), D: o('Ancre_poignee_translation_D_reel') };
  const ancreChariot = { G: o('Ancre_translation_G_reel'), D: o('Ancre_translation_D_reel') };
  const ancreFixe = o('Ancre_levage_fixe_reel');
  const tambour = monde(o('Sortie_treuil_reel')).sub(new THREE.Vector3(R_TAMBOUR - 0.006, 0, 0));
  // treuil à engrenages : tambour + grande roue + rochet sur un arbre, pignon + manivelle sur l'autre
  const arbreTambour = o('Tambour_reel');
  const manivelle = o('Manivelle_reel');
  const cliquet = o('Cliquet_reel');
  const RAPPORT = (arbreTambour?.userData.dents ?? 56) / (manivelle?.userData.dents ?? 14);
  const DENTS_ROCHET = arbreTambour?.userData.rochet ?? 20;

  // les câbles posés dans Blender sont remplacés par des câbles calculés en direct
  const statiques = [];
  model.traverse((x) => { if (x.userData?.statique) { statiques.push(x); x.visible = false; } });

  const rG = reasHaut[0].userData.rayon_gorge;
  const rD = deviation.userData.rayon_gorge;
  const rR = renvoi.G.userData.rayon_gorge;
  const limC = chariot.userData;
  const limM = moufle.userData;

  const etat = { x: 0, vx: 0, ax: 0, levee: 0, vl: 0, theta: 0, omega: 0 };
  const xRepos = chariot.position.x;
  const moufleRepos = moufle.position.clone();
  const pivot = reasHaut[1].position.clone();
  const angles = {
    haut: reasHaut.map((r) => r.rotation.z), bas: reasBas.map((r) => r.rotation.z),
    dev: deviation.rotation.z, G: renvoi.G.rotation.z, D: renvoi.D.rotation.z,
    tambour: arbreTambour?.rotation.z ?? 0, manivelle: manivelle?.rotation.z ?? 0, cliquet: cliquet?.rotation.z ?? 0,
  };
  const poigneeRepos = { G: poignee.G.position.y + HAUSSE_POIGNEES, D: poignee.D.position.y + HAUSSE_POIGNEES };

  const mat = new THREE.MeshStandardMaterial({ color: 0xb9bec4, metalness: 0.9, roughness: 0.35 });

  // --- câbles de translation ---
  model.updateMatrixWorld(true);
  const NA = 8;
  const transl = {};
  for (const cote of ['G', 'D']) {
    poignee[cote].position.y = poigneeRepos[cote];
    const c = monde(renvoi[cote]);
    const pts = Array.from({ length: NA + 2 }, () => new THREE.Vector3());
    const tube = new TubeCorde(pts.length, RAYON_TRANSLATION, mat, 8);
    scene.add(tube);
    const horiz0 = monde(ancreChariot[cote]).distanceTo(new THREE.Vector3(c.x, c.y + rR, c.z));
    transl[cote] = { c, ext: cote === 'G' ? Math.PI : 0, pts, tube, horiz0 };
  }

  // --- câble de levage : brin mort → 3 + 2 réas → poulie de déviation → tambour ---
  const NP = 10, ND = 8, NT = SPIRES * 24 + 1;
  const ptsLevage = Array.from({ length: 1 + NP * 5 + ND + NT }, () => new THREE.Vector3());
  const tubeLevage = new TubeCorde(ptsLevage.length, RAYON_LEVAGE, mat, 8);
  scene.add(tubeLevage);
  const centreDev = monde(deviation);

  function physique(dt) {
    const t = commandesDe(id);
    const dirX = (t.droite ? 1 : 0) - (t.gauche ? 1 : 0);
    const vAvant = etat.vx;
    etat.vx = approche(etat.vx, dirX * VITESSE_CHARIOT, ACCEL_MAX * dt);
    etat.x += etat.vx * dt;
    if (etat.x < limC.min || etat.x > limC.max) {
      etat.x = THREE.MathUtils.clamp(etat.x, limC.min, limC.max);
      etat.vx = 0; // contact avec les tampons des butées
    }
    etat.ax = (etat.vx - vAvant) / dt;

    const dirL = (t.haut ? 1 : 0) - (t.bas ? 1 : 0);
    etat.vl = approche(etat.vl, dirL * VITESSE_LEVAGE, ACCEL_MAX * dt);
    etat.levee += etat.vl * dt;
    if (etat.levee < limM.min || etat.levee > limM.max) {
      etat.levee = THREE.MathUtils.clamp(etat.levee, limM.min, limM.max);
      etat.vl = 0;
    }

    // balancement : la caisse pend sous les réas du haut
    const d = moufleRepos.y + etat.levee - pivot.y;
    const L = -d + CENTRE_GRAVITE;
    if (etat.levee <= limM.min + 1e-4) {
      etat.theta = Math.abs(etat.theta) < 1e-5 ? 0 : etat.theta * 0.8;
      etat.omega = 0;
    } else {
      etat.omega += (-(G / L) * Math.sin(etat.theta) - (etat.ax / L) * Math.cos(etat.theta)) * dt;
      etat.omega *= Math.exp(-0.35 * dt);
      etat.theta += etat.omega * dt;
    }
  }

  const tmp = new THREE.Vector3();
  function appliquer() {
    chariot.position.x = xRepos + etat.x;
    const d = moufleRepos.y + etat.levee - pivot.y;
    moufle.position.set(pivot.x - d * Math.sin(etat.theta), pivot.y + d * Math.cos(etat.theta), moufleRepos.z);
    moufle.rotation.z = etat.theta;
    // réas : le brin n° k défile à k fois la vitesse de levée
    reasHaut.forEach((r, i) => { r.rotation.z = angles.haut[i] - ((2 * i + 1) * etat.levee) / rG; });
    reasBas.forEach((r, i) => { r.rotation.z = angles.bas[i] + ((2 * i + 2) * etat.levee) / rG; });
    deviation.rotation.z = angles.dev - (BRINS * etat.levee) / rD;
    // le tambour enroule 5 fois la levée ; la manivelle tourne « RAPPORT » fois plus vite, en sens inverse
    const aTambour = -(BRINS * etat.levee) / R_TAMBOUR;
    if (arbreTambour) arbreTambour.rotation.z = angles.tambour + aTambour;
    if (manivelle) manivelle.rotation.z = angles.manivelle - aTambour * RAPPORT;
    if (cliquet) {
      // le cliquet se soulève sur chaque dent du rochet, puis retombe
      const dent = (Math.abs(aTambour) * DENTS_ROCHET) / (2 * Math.PI);
      cliquet.rotation.z = angles.cliquet + 0.22 * (dent - Math.floor(dent));
    }
    model.updateMatrixWorld(true);

    // translation : ce que gagne la partie horizontale, la partie verticale le perd
    for (const cote of ['G', 'D']) {
      const tr = transl[cote];
      const a = monde(ancreChariot[cote]);
      const horiz = a.distanceTo(tmp.set(tr.c.x, tr.c.y + rR, tr.c.z));
      const delta = horiz - tr.horiz0;
      poignee[cote].position.y = poigneeRepos[cote] + delta;
      renvoi[cote].rotation.z = angles[cote] + (cote === 'G' ? 1 : -1) * delta / rR;
      poignee[cote].updateMatrixWorld(true);
      tr.pts[0].copy(a);
      arc(tr.c, rR, Math.PI / 2, tr.ext, NA, tr.pts, 1);
      tr.pts[NA + 1].copy(monde(ancrePoignee[cote]));
      tr.tube.maj(tr.pts);
    }

    // levage
    const h = reasHaut.map(monde), b = reasBas.map(monde);
    const mort = monde(ancreFixe);
    let i = 0;
    ptsLevage[i++].set(mort.x - rG, mort.y, h[0].z);
    i = arc(h[0], rG, Math.PI, 0, NP, ptsLevage, i);
    i = arc(b[0], rG, 0, -Math.PI, NP, ptsLevage, i);
    i = arc(h[1], rG, Math.PI, 0, NP, ptsLevage, i);
    i = arc(b[1], rG, 0, -Math.PI, NP, ptsLevage, i);
    i = arc(h[2], rG, Math.PI, 0, NP, ptsLevage, i);
    const sortie = ptsLevage[i - 1];
    i = arc(centreDev, rD, angleTangent(centreDev, rD, sortie), 0, ND, ptsLevage, i);
    // enroulement sur le tambour (le câble arrive tangent par la droite)
    for (let k = 0; k < NT; k++) {
      const a = (k / 24) * 2 * Math.PI;
      ptsLevage[i++].set(tambour.x + R_TAMBOUR * Math.cos(a), tambour.y + R_TAMBOUR * Math.sin(a), tambour.z - 0.11 + (k * 0.22) / (NT - 1));
    }
    tubeLevage.maj(ptsLevage);
  }

  appliquer();

  return {
    etat,
    limites: { chariot: limC, moufle: limM },
    maj(dtFrame) {
      if (!(dtFrame > 0)) return;
      const dtTotal = Math.min(dtFrame, 1 / 20);
      const n = Math.max(1, Math.ceil(dtTotal / (1 / 120)));
      for (let k = 0; k < n; k++) physique(dtTotal / n);
      appliquer();
    },
    detruire() {
      for (const t of [tubeLevage, transl.G.tube, transl.D.tube]) { scene.remove(t); t.geometry.dispose(); }
      mat.dispose();
      for (const x of statiques) x.visible = true;
      chariot.position.x = xRepos;
      moufle.position.copy(moufleRepos);
      moufle.rotation.z = 0;
      reasHaut.forEach((r, k) => { r.rotation.z = angles.haut[k]; });
      reasBas.forEach((r, k) => { r.rotation.z = angles.bas[k]; });
      deviation.rotation.z = angles.dev;
      if (arbreTambour) arbreTambour.rotation.z = angles.tambour;
      if (manivelle) manivelle.rotation.z = angles.manivelle;
      if (cliquet) cliquet.rotation.z = angles.cliquet;
      for (const cote of ['G', 'D']) {
        poignee[cote].position.y = poigneeRepos[cote] - HAUSSE_POIGNEES;
        renvoi[cote].rotation.z = angles[cote];
      }
      if (clavier.proprietaire === id) for (const k in touches) touches[k] = false;
    },
  };
}
