import * as THREE from 'three';

// Tube qui suit une liste de points. Le nombre de points est fixé à la création :
// la géométrie est allouée une fois, puis seules les positions sont mises à jour.
export class TubeCorde extends THREE.Mesh {
  constructor(nbPoints, rayon, materiau, cotes = 6) {
    const geo = new THREE.BufferGeometry();
    const nbSommets = nbPoints * cotes;
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(nbSommets * 3), 3));
    geo.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(nbSommets * 3), 3));
    const index = [];
    for (let i = 0; i < nbPoints - 1; i++) {
      for (let j = 0; j < cotes; j++) {
        const a = i * cotes + j, b = i * cotes + ((j + 1) % cotes);
        const c = a + cotes, d = b + cotes;
        index.push(a, c, b, b, c, d);
      }
    }
    geo.setIndex(index);
    super(geo, materiau);
    this.nbPoints = nbPoints;
    this.rayon = rayon;
    this.cotes = cotes;
    this.castShadow = true;
    this.frustumCulled = false; // la corde bouge : pas de boîte englobante fixe
  }

  maj(points) {
    const pos = this.geometry.attributes.position.array;
    const nor = this.geometry.attributes.normal.array;
    const n = this.nbPoints, k = this.cotes;
    const t = new THREE.Vector3(), nrm = new THREE.Vector3(), bin = new THREE.Vector3(), dir = new THREE.Vector3();
    for (let i = 0; i < n; i++) {
      // tangente
      const a = points[Math.max(i - 1, 0)], b = points[Math.min(i + 1, n - 1)];
      t.subVectors(b, a);
      if (t.lengthSq() < 1e-12) t.set(0, 1, 0);
      t.normalize();
      // repère transporté le long de la corde (évite les torsions brusques)
      if (i === 0) {
        nrm.set(0, 0, 1);
        if (Math.abs(t.z) > 0.9) nrm.set(1, 0, 0);
      }
      nrm.addScaledVector(t, -nrm.dot(t));
      if (nrm.lengthSq() < 1e-8) {
        // repère parallèle à la corde : on repart d'un axe perpendiculaire
        nrm.set(0, 0, 1);
        if (Math.abs(t.z) > 0.9) nrm.set(1, 0, 0);
        nrm.addScaledVector(t, -nrm.dot(t));
      }
      nrm.normalize();
      bin.crossVectors(t, nrm);
      for (let j = 0; j < k; j++) {
        const ang = (j / k) * Math.PI * 2;
        dir.copy(nrm).multiplyScalar(Math.cos(ang)).addScaledVector(bin, Math.sin(ang));
        const o = (i * k + j) * 3;
        pos[o] = points[i].x + dir.x * this.rayon;
        pos[o + 1] = points[i].y + dir.y * this.rayon;
        pos[o + 2] = points[i].z + dir.z * this.rayon;
        nor[o] = dir.x; nor[o + 1] = dir.y; nor[o + 2] = dir.z;
      }
    }
    this.geometry.attributes.position.needsUpdate = true;
    this.geometry.attributes.normal.needsUpdate = true;
  }
}

// Corde molle simulée (intégration de Verlet + contraintes de distance).
// Le premier point est accroché (la main). Les segments ont une longueur fixe : quand la corde
// s'allonge, de nouveaux points sortent de la main, comme une vraie corde qu'on laisse filer ;
// la partie déjà posée au sol ne bouge pas.
export class CordeVerlet {
  constructor(maxPoints, seg, longueur, depart) {
    this.max = maxPoints;
    this.seg = seg;
    this.p = [];
    this.prec = [];
    this.longueur = Math.min(longueur, seg * (maxPoints - 1));
    const n = Math.max(2, Math.ceil(this.longueur / seg) + 1);
    for (let i = 0; i < n; i++) {
      // pend à la verticale puis s'étale sur le sol (vers +z) pour ne pas empiler les points
      const s = Math.max(0, this.longueur - (n - 1 - i) * seg);
      const v = depart.clone();
      if (s <= depart.y) v.y -= s;
      else { v.y = 0; v.z += s - depart.y; }
      this.p.push(v);
      this.prec.push(v.clone());
    }
    this.rendu = Array.from({ length: maxPoints }, () => new THREE.Vector3());
  }

  // Longueur du premier segment (côté main) : le reste de la division
  premier() {
    return this.longueur - (this.p.length - 2) * this.seg;
  }

  setLongueur(l) {
    this.longueur = THREE.MathUtils.clamp(l, this.seg * 0.01, this.seg * (this.max - 1));
    // trop de corde dans le premier segment : un point sort de la main
    while (this.premier() > this.seg && this.p.length < this.max) {
      this.p.splice(1, 0, this.p[0].clone());
      this.prec.splice(1, 0, this.prec[0].clone());
    }
    // la corde rentre : on avale le point le plus proche de la main
    while (this.premier() < 0 && this.p.length > 2) {
      this.p.splice(1, 1);
      this.prec.splice(1, 1);
    }
  }

  // Répartit la corde le long d'un chemin (liste de points), pour partir d'une position propre
  initChemin(chemin) {
    let seg = 0, reste = 0;
    for (let i = 0; i < this.p.length; i++) {
      const s = i === 0 ? 0 : this.premier() + (i - 1) * this.seg;
      // avance sur le chemin jusqu'à la distance s
      while (seg < chemin.length - 2 && s > reste + chemin[seg].distanceTo(chemin[seg + 1])) {
        reste += chemin[seg].distanceTo(chemin[seg + 1]);
        seg++;
      }
      const a = chemin[seg], b = chemin[seg + 1];
      const t = Math.min(1, (s - reste) / (a.distanceTo(b) || 1));
      this.p[i].lerpVectors(a, b, t);
      this.prec[i].copy(this.p[i]);
    }
  }

  // obstacles : cylindres verticaux pleins { x, z, r, yBas, yHaut } que la corde ne traverse pas
  pas(dt, ancre, solY = 0, obstacles = []) {
    const n = this.p.length;
    const gy = -9.81 * dt * dt;
    for (let i = 1; i < n; i++) {
      const p = this.p[i], q = this.prec[i];
      const vx = (p.x - q.x) * 0.985, vy = (p.y - q.y) * 0.985, vz = (p.z - q.z) * 0.985;
      q.copy(p);
      p.x += vx; p.y += vy + gy; p.z += vz;
    }
    const d = new THREE.Vector3();
    const l0 = Math.max(this.premier(), 1e-4);
    for (let it = 0; it < 25; it++) {
      this.p[0].copy(ancre);
      for (let i = 0; i < n - 1; i++) {
        const a = this.p[i], b = this.p[i + 1];
        d.subVectors(b, a);
        const l = d.length() || 1e-9;
        const corr = (l - (i === 0 ? l0 : this.seg)) / l;
        if (i === 0) {
          b.addScaledVector(d, -corr); // le point accroché ne bouge pas
        } else if (i === n - 2) {
          a.addScaledVector(d, corr * 0.8); // la poignée au bout est plus lourde que la corde
          b.addScaledVector(d, -corr * 0.2);
        } else {
          a.addScaledVector(d, corr * 0.5);
          b.addScaledVector(d, -corr * 0.5);
        }
      }
      for (const o of obstacles) {
        for (let i = 1; i < n; i++) {
          const p = this.p[i];
          if (p.y <= o.yBas || p.y >= o.yHaut) continue;
          const dx = p.x - o.x, dz = p.z - o.z;
          const r2 = dx * dx + dz * dz;
          if (r2 >= o.r * o.r) continue;
          // sortie par le chemin le plus court : côté, dessus ou dessous
          const r = Math.sqrt(r2);
          const cote = o.r - r, dessus = o.yHaut - p.y, dessous = p.y - o.yBas;
          if (cote <= dessus && cote <= dessous) {
            const k = r > 1e-6 ? o.r / r : 0;
            if (k) { p.x = o.x + dx * k; p.z = o.z + dz * k; } else { p.x = o.x + o.r; }
          } else if (dessus <= dessous) p.y = o.yHaut;
          else p.y = o.yBas;
        }
      }
      // sol avec frottement : un point posé ne glisse presque pas
      for (let i = 1; i < n; i++) {
        const p = this.p[i];
        if (p.y < solY) {
          p.y = solY;
          const q = this.prec[i];
          q.x += (p.x - q.x) * 0.7;
          q.z += (p.z - q.z) * 0.7;
        }
      }
    }
  }

  // Points pour le tube (nombre fixe) : les points inutilisés sont regroupés dans la main
  points() {
    const vide = this.max - this.p.length;
    for (let i = 0; i < this.max; i++) {
      this.rendu[i].copy(i < vide ? this.p[0] : this.p[i - vide]);
    }
    return this.rendu;
  }
}
