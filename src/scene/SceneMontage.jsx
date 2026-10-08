import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useModele, Studio } from './commun.jsx';
import { creerMecanisme } from './mecanisme.js';

// Pièces posées à chaque étape de la notice, et d'où elles arrivent (décalage en mètres)
const ETAPES = [
  [['Socle_G', [0, 0.35, 0]], ['Socle_D', [0, 0.35, 0]]],
  [['Pied_G', [0, 0.65, 0]], ['Pied_D', [0, 0.65, 0]]],
  [['Tiges_G', [0, 0.3, 0]], ['Tiges_D', [0, 0.3, 0]]],
  [['Poutre', [0, 0.45, 0]], ['Chariot_corps', [0, 0.45, 0]]],
  [['Equerres_G', [-0.25, 0.08, 0]], ['Equerres_D', [0.25, 0.08, 0]]],
  [
    ['Support_haut', [0, 0, 0.45]], ['Poulie_haut_1', [0, 0, 0.45]], ['Poulie_haut_2', [0, 0, 0.45]],
    ['Poulie_haut_3', [0, 0, 0.45]], ['Moufle', [0, 0, 0.6]],
  ],
  [
    ['Chape_renvoi_G', [-0.2, 0, 0]], ['Poulie_renvoi_G', [-0.2, 0, 0]],
    ['Chape_renvoi_D', [0.2, 0, 0]], ['Poulie_renvoi_D', [0.2, 0, 0]], ['Poignees', [0, 0.3, 0]],
  ],
  [],
];
const DUREE_POSE = 0.7; // part de l'étape pendant laquelle les pièces arrivent

const sortieDouce = (t) => 1 - Math.pow(1 - t, 3);
const poseRebond = (t) => { const c = 1.4; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
const lisse = (t) => t * t * (3 - 2 * t);
const borne = (t) => Math.min(1, Math.max(0, t));

export default function SceneMontage({ progression }) {
  const modele = useModele();
  const { scene, camera } = useThree();
  const mecanisme = useRef(null);
  const etatCordes = useRef({ palan: false, translation: false });

  const pieces = useMemo(
    () => ETAPES.map((liste) => liste.map(([nom, d]) => {
      const obj = modele.getObjectByName(nom);
      return { obj, repos: obj.position.clone(), d: new THREE.Vector3(...d) };
    })),
    [modele]
  );

  useEffect(() => {
    const m = creerMecanisme(modele, scene, { piloter: false });
    mecanisme.current = m;
    return () => { m.detruire(); mecanisme.current = null; };
  }, [modele, scene]);

  const cible = useMemo(() => new THREE.Vector3(0, 0.4, 0), []);
  const pos = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, dt) => {
    const p = progression.current;

    pieces.forEach((liste, i) => {
      const t = borne((p - i) / DUREE_POSE);
      for (const { obj, repos, d } of liste) {
        obj.visible = t > 0.001;
        const e = i === 5 ? sortieDouce(t) : poseRebond(t);
        obj.position.copy(repos).addScaledVector(d, 1 - e);
      }
    });

    const m = mecanisme.current;
    if (m) {
      const palan = p >= 5 + DUREE_POSE;
      const transl = p >= 6 + DUREE_POSE;
      if (palan && !etatCordes.current.palan) m.replacerReste();
      etatCordes.current = { palan, translation: transl };
      m.cordes.palan.forEach((c) => (c.visible = palan));
      m.cordes.translation.forEach((c) => (c.visible = transl));
      m.pieces.poigneeLevage.visible = palan;
      m.maj(dt);
    }

    // Caméra : de face (comme le plan) vers le trois-quarts, puis on fait le tour pour la vérification
    const entree = lisse(borne(p / 1.2));
    const fin = lisse(borne(p - 7));
    const az = THREE.MathUtils.lerp(0, 0.62, entree) + 0.03 * p - 1.15 * fin;
    const el = THREE.MathUtils.lerp(0.06, 0.3, entree) + 0.05 * fin;
    const r = THREE.MathUtils.lerp(2.35, 2.45, entree) + 0.1 * fin;
    pos.set(Math.sin(az) * Math.cos(el) * r, cible.y + Math.sin(el) * r, Math.cos(az) * Math.cos(el) * r);
    camera.position.lerp(pos, 1 - Math.exp(-dt * 6));
    camera.lookAt(cible);
  });

  return (
    <>
      <Studio ombre={0.22} />
      <primitive object={modele} />
    </>
  );
}
