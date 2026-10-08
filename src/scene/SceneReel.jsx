import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html, OrbitControls, useGLTF, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { creerMecanismeReel } from './mecanismeReel.js';
import { fusionnerGroupe } from './fusion.js';

// Le portique réel (échelle 1:1, en mètres). Les matériaux du .glb portent un nom de rôle ;
// on y applique ici les textures (UV dépliés à l'échelle : 1 unité = 1 m).
const URL = '/portique_reel.glb';
useGLTF.preload(URL);

export const FOND_ACIER = '#1b1d20';
// cible décalée à gauche : le portique se place à droite du texte
export const VUE_GENERALE = { camera: [10.5, 6.4, 16.5], cible: [-2.4, 3.4, 0] };

function preparerTextures(t, repetition = 1, couleur = false) {
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(repetition, repetition);
  t.flipY = false;
  t.anisotropy = 8;
  if (couleur) t.colorSpace = THREE.SRGBColorSpace;
  t.needsUpdate = true;
  return t;
}

function useMateriaux() {
  const tx = useTexture({
    jaune: '/textures/reel/peinture_jaune.jpg',
    grise: '/textures/reel/peinture_grise.jpg',
    pRough: '/textures/reel/peinture_rugosite.jpg',
    pNorm: '/textures/reel/peinture_normale.jpg',
    bCoul: '/textures/reel/beton_couleur.jpg',
    bRough: '/textures/reel/beton_rugosite.jpg',
    bNorm: '/textures/reel/beton_normale.jpg',
  });
  // useTexture renvoie un nouvel objet à chaque rendu : on dépend des textures elles-mêmes (mises en cache),
  // sinon matériaux, modèle et mécanisme seraient reconstruits en boucle
  const { jaune, grise, pRough, pNorm, bCoul, bRough, bNorm } = tx;
  return useMemo(() => {
    preparerTextures(tx.jaune, 1, true);
    preparerTextures(tx.grise, 1, true);
    preparerTextures(tx.pRough);
    preparerTextures(tx.pNorm);
    // le béton couvre 2 m : moitié moins de répétitions
    const beton = (t, c) => preparerTextures(t.clone(), 0.5, c);
    const sol = (t, c) => preparerTextures(t.clone(), 20, c);
    const peinture = (map) => new THREE.MeshStandardMaterial({
      map, roughnessMap: tx.pRough, normalMap: tx.pNorm, roughness: 1, metalness: 0,
      normalScale: new THREE.Vector2(0.8, 0.8),
    });
    return {
      peinture_jaune: peinture(tx.jaune),
      peinture_grise: peinture(tx.grise),
      beton: new THREE.MeshStandardMaterial({ map: beton(tx.bCoul, true), roughnessMap: beton(tx.bRough), normalMap: beton(tx.bNorm), roughness: 1 }),
      sol: new THREE.MeshStandardMaterial({ map: sol(tx.bCoul, true), roughnessMap: sol(tx.bRough), normalMap: sol(tx.bNorm), roughness: 1 }),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jaune, grise, pRough, pNorm, bCoul, bRough, bNorm]);
}

function Environnement() {
  const { gl, scene } = useThree();
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    scene.environmentIntensity = 0.7;
    scene.fog = new THREE.Fog(FOND_ACIER, 22, 48);
    return () => { env.dispose(); pmrem.dispose(); scene.environment = null; scene.fog = null; };
  }, [gl, scene]);
  return null;
}

// Repère numéroté posé sur la pièce ; un clic recadre la caméra dessus.
// S'il est posé sur une pièce mobile (« suivre »), il l'accompagne dans ses déplacements.
function Repere({ point, actif, onChoisir, modele }) {
  const groupe = useRef(null);
  const suivi = useMemo(() => {
    const obj = point.suivre && modele.getObjectByName(point.suivre);
    if (!obj) return null;
    modele.updateMatrixWorld(true);
    const decalage = new THREE.Vector3(...point.position).sub(obj.getWorldPosition(new THREE.Vector3()));
    return { obj, decalage };
  }, [point, modele]);
  useFrame(() => {
    if (suivi && groupe.current) suivi.obj.getWorldPosition(groupe.current.position).add(suivi.decalage);
  });
  return (
    <group ref={groupe} position={point.position}>
    <Html center zIndexRange={[30, 0]}>
      <button
        className={`reel-repere ${actif ? 'actif' : ''}`}
        onClick={() => onChoisir(point.id)}
        aria-label={point.titre}
        aria-pressed={actif}
      >
        <span>{point.numero}</span>
      </button>
    </Html>
    </group>
  );
}

function Camera({ vise, controles }) {
  const { camera } = useThree();
  const cible = useRef({ pos: new THREE.Vector3(...VUE_GENERALE.camera), regard: new THREE.Vector3(...VUE_GENERALE.cible), actif: false });
  useEffect(() => {
    const v = vise ?? VUE_GENERALE;
    cible.current.pos.set(...v.camera);
    cible.current.regard.set(...v.cible);
    cible.current.actif = true;
  }, [vise]);
  useEffect(() => {
    const c = controles.current;
    if (!c) return;
    // dès que l'utilisateur tourne la vue lui-même, on arrête le recadrage automatique
    const stop = () => { cible.current.actif = false; };
    c.addEventListener('start', stop);
    return () => c.removeEventListener('start', stop);
  }, [controles]);
  useFrame((_, dt) => {
    const c = controles.current;
    if (!cible.current.actif || !c) return;
    const k = 1 - Math.exp(-dt * 3);
    camera.position.lerp(cible.current.pos, k);
    c.target.lerp(cible.current.regard, k);
    c.update();
    if (camera.position.distanceTo(cible.current.pos) < 0.01) cible.current.actif = false;
  });
  return null;
}

export default function SceneReel({ points, actif, onChoisir, onEtat }) {
  const { scene } = useGLTF(URL);
  const materiaux = useMateriaux();
  const controles = useRef(null);

  const modele = useMemo(() => {
    const m = scene.clone(true);
    const statiques = [];
    m.traverse((o) => {
      if (o.userData?.statique) statiques.push(o);   // câbles figés : le site les recalcule
      if (!o.isMesh) return;
      o.castShadow = true;
      o.receiveShadow = true;
      const remplace = materiaux[o.material?.name];
      if (remplace) o.material = remplace;
    });
    for (const o of statiques) o.parent.remove(o);
    // une pièce par matériau et par ensemble mobile : environ 30 appels de dessin au lieu de 213
    const g = (n) => m.getObjectByName(n);
    fusionnerGroupe(g('Charge_reel'));
    fusionnerGroupe(g('Moufle_reel'), new Set(['Charge_reel', 'R_Rea_bas_1', 'R_Rea_bas_2']));
    fusionnerGroupe(g('Chariot_reel'), new Set(['Moufle_reel', 'R_Rea_haut_1', 'R_Rea_haut_2', 'R_Rea_haut_3']));
    fusionnerGroupe(g('Structure_reel'), new Set(['R_Poulie_renvoi_G', 'R_Poulie_renvoi_D', 'R_Poulie_deviation', 'Tambour_reel', 'Manivelle_reel', 'Cliquet_reel']));
    fusionnerGroupe(g('Tambour_reel'));
    fusionnerGroupe(g('Manivelle_reel'));
    fusionnerGroupe(g('Poignee_translation_G_reel'));
    fusionnerGroupe(g('Poignee_translation_D_reel'));
    return m;
  }, [scene, materiaux]);

  const { scene: scene3d } = useThree();
  const mecanisme = useRef(null);
  const dernier = useRef(0);
  useEffect(() => {
    const m = creerMecanismeReel(modele, scene3d);
    mecanisme.current = m;
    return () => { m.detruire(); mecanisme.current = null; };
  }, [modele, scene3d]);
  useFrame((state, dt) => {
    const m = mecanisme.current;
    if (!m) return;
    m.maj(dt);
    if (onEtat && state.clock.elapsedTime - dernier.current > 0.1) {
      dernier.current = state.clock.elapsedTime;
      const h = m.etat.levee - m.limites.moufle.min;
      onEtat({ x: m.etat.x, hauteur: h, cable: 5 * h });
    }
  });

  const vise = actif ? points.find((p) => p.id === actif)?.vue : null;

  return (
    <>
      <Environnement />
      <hemisphereLight args={[0xdfe8ff, 0x3a3631, 0.6]} />
      <directionalLight
        position={[9, 14, 7]}
        intensity={2.6}
        color={0xfff2df}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-9}
        shadow-camera-right={9}
        shadow-camera-top={10}
        shadow-camera-bottom={-6}
        shadow-camera-near={1}
        shadow-camera-far={40}
        shadow-bias={-0.0004}
        shadow-normalBias={0.03}
      />
      <directionalLight position={[-8, 5, -6]} intensity={0.5} color={0xbcd0ff} />
      <mesh rotation-x={-Math.PI / 2} position-y={-0.001} receiveShadow material={materiaux.sol}>
        <planeGeometry args={[90, 90]} />
      </mesh>
      <primitive object={modele} />
      {points.map((p) => (
        <Repere key={p.id} point={p} actif={actif === p.id} onChoisir={onChoisir} modele={modele} />
      ))}
      <OrbitControls
        ref={controles}
        target={VUE_GENERALE.cible}
        enableZoom={false}
        enablePan={false}
        enableDamping
        minPolarAngle={0.2}
        maxPolarAngle={Math.PI / 2 - 0.04}
      />
      <Camera vise={vise} controles={controles} />
    </>
  );
}
