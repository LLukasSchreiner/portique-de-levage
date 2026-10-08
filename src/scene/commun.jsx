import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { PerformanceMonitor, Stats, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const URL_MODELE = '/portique.glb';
const DEBUG = typeof location !== 'undefined' && location.search.includes('debug');
useGLTF.preload(URL_MODELE);

// Copie du modèle propre à chaque scène (chaque vue peut le modifier sans gêner les autres)
export function useModele() {
  const { scene } = useGLTF(URL_MODELE);
  return useMemo(() => {
    const m = scene.clone(true);
    m.traverse((o) => {
      if (o.isMesh) {
        o.castShadow = true;
        o.receiveShadow = true;
      }
    });
    return m;
  }, [scene]);
}

// Canvas transparent posé sur la feuille : il ne calcule que lorsqu'il est visible
export function Vue3D({ children, camera, cible, className = '', style }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  const [dpr, setDpr] = useState(Math.min(window.devicePixelRatio || 1, 1.5));
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: '0px' });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} className={`vue3d ${className}`} style={style}>
      <Canvas
        frameloop={visible ? 'always' : 'never'}
        shadows
        dpr={dpr}
        camera={{ fov: 32, near: 0.01, far: 30, position: [1, 0.8, 1.6], ...camera }}
        gl={{ alpha: true, antialias: true, powerPreference: 'high-performance', toneMapping: THREE.ACESFilmicToneMapping, outputColorSpace: THREE.SRGBColorSpace }}
      >
        {/* qualité adaptative : si les images ralentissent, la résolution baisse, puis remonte */}
        <PerformanceMonitor
          onDecline={() => setDpr((d) => Math.max(0.75, +(d - 0.25).toFixed(2)))}
          onIncline={() => setDpr((d) => Math.min(Math.min(window.devicePixelRatio || 1, 1.5), +(d + 0.25).toFixed(2)))}
          flipflops={4}
          onFallback={() => setDpr(1)}
        />
        {DEBUG && visible && <Stats className="stats-debug" />}
        {cible && <Regard cible={cible} />}
        {children}
      </Canvas>
    </div>
  );
}

// Lumière d'atelier et ombre portée sur la feuille (le sol est invisible, seule l'ombre reste)
export function Studio({ ombre = 0.28 }) {
  const { gl, scene } = useThree();
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    scene.environmentIntensity = 0.55;
    return () => { env.dispose(); pmrem.dispose(); scene.environment = null; };
  }, [gl, scene]);

  return (
    <>
      <hemisphereLight args={[0xfff6ea, 0x8a7f72, 0.8]} />
      <directionalLight
        position={[1.2, 2.2, 1.6]}
        intensity={2.2}
        color={0xfff1e0}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-0.8}
        shadow-camera-right={0.8}
        shadow-camera-top={0.8}
        shadow-camera-bottom={-0.8}
        shadow-camera-near={0.5}
        shadow-camera-far={5}
        shadow-bias={-0.0005}
        shadow-normalBias={0.01}
      />
      <directionalLight position={[-1.5, 1.2, -1.2]} intensity={0.6} color={0xdfe8ff} />
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[6, 6]} />
        <shadowMaterial transparent opacity={ombre} depthWrite={false} />
      </mesh>
    </>
  );
}

// Oriente la caméra vers un point (quand rien d'autre ne la pilote)
function Regard({ cible }) {
  const { camera } = useThree();
  useEffect(() => { camera.lookAt(...cible); }, [camera, cible]);
  return null;
}
