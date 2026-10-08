import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

// Fusionne les maillages fixes d'un groupe en un maillage par matériau (beaucoup moins d'appels de dessin).
// Les sous-arbres listés dans « garder » (pièces mobiles ou qui tournent) ne sont pas touchés.
export function fusionnerGroupe(groupe, garder = new Set()) {
  groupe.updateMatrixWorld(true);
  const inverse = groupe.matrixWorld.clone().invert();
  const parMateriau = new Map();
  const aRetirer = [];

  const parcourir = (o) => {
    if (o !== groupe && garder.has(o.name)) return;
    if (o.isMesh && o.visible) {
      const g = o.geometry.clone();
      g.applyMatrix4(new THREE.Matrix4().multiplyMatrices(inverse, o.matrixWorld));
      // attributs communs pour pouvoir fusionner
      for (const nom of Object.keys(g.attributes)) if (!['position', 'normal', 'uv'].includes(nom)) g.deleteAttribute(nom);
      if (!g.index) g.setIndex([...Array(g.attributes.position.count).keys()]);
      if (!g.attributes.uv) g.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(g.attributes.position.count * 2), 2));
      const cle = o.material;
      if (!parMateriau.has(cle)) parMateriau.set(cle, []);
      parMateriau.get(cle).push(g);
      aRetirer.push(o);
    }
    for (const c of o.children) parcourir(c);
  };
  parcourir(groupe);

  // on retire les maillages fusionnés ; leurs enfants (repères d'accroche…) sont rattachés au groupe
  for (const o of aRetirer) {
    for (const c of [...o.children]) groupe.attach(c);
    o.parent.remove(o);
  }
  for (const [materiau, geos] of parMateriau) {
    const g = mergeGeometries(geos, false);
    for (const x of geos) x.dispose();
    if (!g) continue;
    const m = new THREE.Mesh(g, materiau);
    m.name = `${groupe.name}_fusion_${materiau.name}`;
    m.castShadow = true;
    m.receiveShadow = true;
    groupe.add(m);
  }
  return aRetirer.length;
}
