import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useModele, Studio } from './commun.jsx';
import { creerMecanisme } from './mecanisme.js';

// Le portique piloté : chariot, palan, cordes, poulies et balancement de la charge
export default function SceneSimulateur({ onEtat }) {
  const modele = useModele();
  const { scene } = useThree();
  const mecanisme = useRef(null);
  const dernier = useRef(0);

  useEffect(() => {
    const m = creerMecanisme(modele, scene);
    mecanisme.current = m;
    return () => { m.detruire(); mecanisme.current = null; };
  }, [modele, scene]);

  useFrame((state, dt) => {
    const m = mecanisme.current;
    if (!m) return;
    m.maj(dt);
    // mise à jour de l'affichage limitée à 10 fois par seconde
    if (onEtat && state.clock.elapsedTime - dernier.current > 0.1) {
      dernier.current = state.clock.elapsedTime;
      onEtat({
        x: m.etat.x,
        hauteur: m.etat.levee - m.limites.moufle.min,
        corde: 5 * (m.etat.levee - m.limites.moufle.min),
      });
    }
  });

  return (
    <>
      <Studio ombre={0.28} />
      <primitive object={modele} />
      <OrbitControls
        target={[0, 0.38, 0]}
        enableZoom={false}
        enablePan={false}
        enableDamping
        minPolarAngle={0.35}
        maxPolarAngle={Math.PI / 2 - 0.05}
      />
    </>
  );
}
