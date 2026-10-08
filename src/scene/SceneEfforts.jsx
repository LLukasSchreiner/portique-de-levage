import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, Line } from '@react-three/drei';
import * as THREE from 'three';
import { useModele, Studio } from './commun.jsx';

// Portique immobile, avec les efforts du calcul de dimensionnement
const ROUGE = '#b4432f';
const BLEU = '#2f5079';
const ORANGE = '#c9772a';

function Fleche({ depuis, vers, couleur, label, progression, debut = 0, cote = 'droite' }) {
  const groupe = useRef(null);
  const corps = useRef(null);
  const pointe = useRef(null);
  const etiquette = useRef(null);
  const { a, dir, longueur, quat } = useMemo(() => {
    const a = new THREE.Vector3(...depuis), b = new THREE.Vector3(...vers);
    const d = b.clone().sub(a);
    const longueur = d.length();
    const dir = d.normalize();
    return { a, dir, longueur, quat: new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir) };
  }, [depuis, vers]);

  useFrame(() => {
    const t = THREE.MathUtils.clamp((progression.current - debut) / 0.35, 0, 1);
    const e = 1 - Math.pow(1 - t, 3);
    const l = Math.max(longueur * e, 0.0001);
    const tete = 0.035;
    groupe.current.visible = t > 0;
    corps.current.scale.set(1, Math.max(l - tete, 0.0001), 1);
    corps.current.position.copy(dir).multiplyScalar(Math.max(l - tete, 0) / 2);
    pointe.current.position.copy(dir).multiplyScalar(Math.max(l - tete / 2, tete / 2));
    if (etiquette.current) etiquette.current.style.opacity = String(THREE.MathUtils.clamp((t - 0.6) / 0.4, 0, 1));
  });

  return (
    <group ref={groupe} position={a}>
      <mesh ref={corps} quaternion={quat}>
        <cylinderGeometry args={[0.0045, 0.0045, 1, 10]} />
        <meshBasicMaterial color={couleur} />
      </mesh>
      <mesh ref={pointe} quaternion={quat}>
        <coneGeometry args={[0.014, 0.035, 16]} />
        <meshBasicMaterial color={couleur} />
      </mesh>
      <Html position={dir.clone().multiplyScalar(longueur * 0.5)} center={false} zIndexRange={[20, 0]}>
        <div ref={etiquette} className={`fleche-label fleche-label--${cote}`} style={{ color: couleur, opacity: 0 }}>
          {label}
        </div>
      </Html>
    </group>
  );
}

function ArcMoment({ progression, debut }) {
  const ligne = useRef(null);
  const etiquette = useRef(null);
  const points = useMemo(() => {
    const pts = [];
    for (let i = 0; i <= 40; i++) {
      const a = THREE.MathUtils.degToRad(200 + (i / 40) * 140);
      pts.push(new THREE.Vector3(Math.cos(a) * 0.085, 0.74 + Math.sin(a) * 0.085, 0.07));
    }
    return pts;
  }, []);
  const fin = points[points.length - 1];
  const avant = points[points.length - 2];
  const quat = useMemo(
    () => new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), fin.clone().sub(avant).normalize()),
    [fin, avant]
  );
  const pointe = useRef(null);
  useFrame(() => {
    const t = THREE.MathUtils.clamp((progression.current - debut) / 0.35, 0, 1);
    if (ligne.current) {
      ligne.current.geometry.instanceCount = Math.max(1, Math.round(t * (points.length - 1)));
      ligne.current.visible = t > 0;
    }
    if (pointe.current) pointe.current.visible = t > 0.95;
    if (etiquette.current) etiquette.current.style.opacity = String(THREE.MathUtils.clamp((t - 0.6) / 0.4, 0, 1));
  });
  return (
    <group>
      <Line ref={ligne} points={points} color={ROUGE} lineWidth={2.2} dashed={false} />
      <mesh ref={pointe} position={fin} quaternion={quat}>
        <coneGeometry args={[0.011, 0.028, 14]} />
        <meshBasicMaterial color={ROUGE} />
      </mesh>
      <Html position={[-0.24, 0.88, 0.07]} center zIndexRange={[20, 0]}>
        <div ref={etiquette} className="fleche-label" style={{ color: ROUGE, opacity: 0 }}>M = 6,98 N·m</div>
      </Html>
    </group>
  );
}

export default function SceneEfforts({ progression }) {
  const modele = useModele();
  return (
    <>
      <Studio ombre={0.25} />
      <primitive object={modele} />
      {/* charge au milieu de la poutre */}
      <Fleche depuis={[0, 1.07, 0]} vers={[0, 0.8, 0]} couleur={ROUGE} label="F = 49 N" progression={progression} debut={0} />
      {/* réactions des appuis */}
      <Fleche depuis={[-0.345, -0.26, 0]} vers={[-0.345, -0.012, 0]} couleur={BLEU} label="R = 24,5 N" progression={progression} debut={0.25} cote="gauche" />
      <Fleche depuis={[0.345, -0.26, 0]} vers={[0.345, -0.012, 0]} couleur={BLEU} label="R = 24,5 N" progression={progression} debut={0.3} />
      <ArcMoment progression={progression} debut={0.45} />
      {/* poussée latérale (basculement), perpendiculaire à la poutre */}
      <Fleche depuis={[0.37, 0.74, -0.32]} vers={[0.37, 0.74, -0.04]} couleur={ORANGE} label="poussée 2,9 N" progression={progression} debut={0.65} />
    </>
  );
}
