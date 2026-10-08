import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import SceneCanvas from "./SceneCanvas";
import { C, damp, disposeAll, easeOut, makeGlowTexture, makeLabelTexture } from "./helpers";

const LAYERS = [
  { name: "LEARN", y: -1.05, r: 2.35, color: C.royal },
  { name: "PRACTICE", y: -0.35, r: 2.1, color: C.blue },
  { name: "BUILD", y: 0.35, r: 1.85, color: "#3db3f5" },
  { name: "INNOVATE", y: 1.05, r: 1.6, color: C.ice },
];

export function Core({ activeLayer = -1, quality = "high" }) {
  const interactive = quality === "high";
  const labels = useMemo(() => LAYERS.map((l) => makeLabelTexture(l.name, 30)), []);
  const glow = useMemo(() => makeGlowTexture(), []);
  const aiLabel = useMemo(() => makeLabelTexture("AI", 34), []);
  const mats = useMemo(
    () =>
      LAYERS.map((l) => ({
        ring: new THREE.MeshStandardMaterial({ color: l.color, emissive: l.color, emissiveIntensity: 0.6, transparent: true, opacity: 0, roughness: 0.3 }),
        disc: new THREE.MeshStandardMaterial({ color: l.color, emissive: C.blue, emissiveIntensity: 0.15, transparent: true, opacity: 0, roughness: 0.2, depthWrite: false }),
      })),
    []
  );
  const particles = useMemo(() => {
    const n = quality === "low" ? 50 : 110;
    const g = new THREE.BufferGeometry();
    const p = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = 0.9 + Math.random() * 1.7;
      p.set([Math.cos(a) * r, (Math.random() - 0.5) * 2.8, Math.sin(a) * r], i * 3);
    }
    g.setAttribute("position", new THREE.BufferAttribute(p, 3));
    return g;
  }, [quality]);
  useEffect(() => () => {
    disposeAll(labels, glow, aiLabel, particles, mats.flatMap((m) => [m.ring, m.disc]));
  }, [labels, glow, aiLabel, particles, mats]);

  const root = useRef(null);
  const core = useRef(null);
  const coreMat = useRef(null);
  const layerGroups = useRef([]);
  const aiRef = useRef(null);
  const beam = useRef(null);
  const st = useRef({ t0: null, hl: LAYERS.map(() => 0), ox: 0, oy: 0 });

  useFrame((state, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const t = state.clock.elapsedTime;
    const s = st.current;
    if (s.t0 === null) s.t0 = t;
    const age = t - s.t0;

    const px = interactive ? state.pointer.x : 0;
    const py = interactive ? state.pointer.y : 0;
    s.ox = damp(s.ox, px * 0.5, 3, dt);
    s.oy = damp(s.oy, -py * 0.15, 3, dt);
    state.camera.position.x = damp(state.camera.position.x, s.ox * 0.6, 2, dt);
    state.camera.lookAt(0, 0, 0);

    const coreE = easeOut(age / 0.9);
    const anyHot = activeLayer >= 0 ? 1 : 0;
    if (core.current) {
      const pulse = 1 + Math.sin(t * 2.2) * 0.04 + anyHot * 0.08;
      core.current.scale.setScalar((0.2 + 0.8 * coreE) * pulse);
      core.current.rotation.y += dt * 0.5;
    }
    if (coreMat.current) coreMat.current.emissiveIntensity = (0.9 + anyHot * 0.9) * coreE;

    LAYERS.forEach((l, i) => {
      const e = easeOut((age - 0.9 - i * 0.55) / 0.7);
      s.hl[i] = damp(s.hl[i], i === activeLayer ? 1 : 0, 8, dt);
      const g = layerGroups.current[i];
      if (g) {
        g.position.y = l.y * e;
        g.scale.setScalar(0.15 + 0.85 * e + s.hl[i] * 0.04);
        g.rotation.y += dt * (i % 2 ? -0.22 : 0.18);
      }
      mats[i].ring.opacity = e;
      mats[i].ring.emissiveIntensity = 0.6 + s.hl[i] * 2.2;
      mats[i].disc.opacity = e * (0.16 + s.hl[i] * 0.22);
    });
    if (aiRef.current) {
      const e = easeOut((age - 0.9 - 4 * 0.55) / 0.6);
      aiRef.current.scale.setScalar(Math.max(0.001, e));
      aiRef.current.rotation.y += dt * 0.8;
    }
    if (beam.current) {
      const y = activeLayer >= 0 ? LAYERS[activeLayer].y : 0;
      beam.current.position.y = damp(beam.current.position.y, y, 8, dt);
      beam.current.intensity = damp(beam.current.intensity, activeLayer >= 0 ? 6 : 0, 8, dt);
    }
    if (root.current) root.current.rotation.y = Math.sin(t * 0.15) * 0.12 + s.ox * 0.3;
  });

  return (
    <group ref={root}>
      <pointLight ref={beam} color={C.ice} intensity={0} distance={6} />
      <group ref={core}>
        <mesh>
          <icosahedronGeometry args={[0.46, 1]} />
          <meshStandardMaterial ref={coreMat} color={C.blue} emissive={C.blue} emissiveIntensity={0.9} roughness={0.25} />
        </mesh>
        <mesh>
          <icosahedronGeometry args={[0.68, 1]} />
          <meshBasicMaterial color={C.ice} wireframe transparent opacity={0.3} />
        </mesh>
      </group>
      <sprite scale={[3.4, 3.4, 1]}>
        <spriteMaterial map={glow} color={C.blue} transparent opacity={0.55} depthWrite={false} blending={THREE.AdditiveBlending} />
      </sprite>
      <mesh>
        <cylinderGeometry args={[0.015, 0.015, 3.6, 6]} />
        <meshBasicMaterial color={C.ice} transparent opacity={0.4} />
      </mesh>

      {LAYERS.map((l, i) => (
        <group key={l.name} ref={(el) => { layerGroups.current[i] = el; }}>
          <mesh rotation-x={Math.PI / 2} material={mats[i].ring}>
            <torusGeometry args={[l.r, 0.035, 10, 72]} />
          </mesh>
          <mesh rotation-x={Math.PI / 2} material={mats[i].ring} scale={0.72}>
            <torusGeometry args={[l.r, 0.015, 8, 56]} />
          </mesh>
          <mesh material={mats[i].disc}>
            <cylinderGeometry args={[l.r - 0.02, l.r - 0.02, 0.03, 48, 1, false]} />
          </mesh>
          <sprite position={[l.r + 0.5, 0.05, 0.4]} scale={[0.3 * (labels[i]?.userData.aspect ?? 3), 0.3, 1]}>
            <spriteMaterial map={labels[i]} transparent opacity={0.95} depthWrite={false} />
          </sprite>
        </group>
      ))}

      <group ref={aiRef} position={[0, 1.95, 0]}>
        <mesh>
          <octahedronGeometry args={[0.2, 0]} />
          <meshStandardMaterial color={C.ice} emissive={C.ice} emissiveIntensity={0.9} />
        </mesh>
        <sprite position={[0, 0.42, 0]} scale={[0.26 * (aiLabel?.userData.aspect ?? 2), 0.26, 1]}>
          <spriteMaterial map={aiLabel} transparent depthWrite={false} />
        </sprite>
      </group>

      <points geometry={particles}>
        <pointsMaterial color={C.ice} size={0.05} sizeAttenuation transparent opacity={0.7} depthWrite={false} blending={THREE.AdditiveBlending} />
      </points>
    </group>
  );
}

export default function WhyCore3D({ quality, active, eventSource, onReady, ...props }) {
  return (
    <SceneCanvas quality={quality} active={active} eventSource={eventSource} onReady={onReady} camera={{ fov: 32, position: [0, 0.9, 9.4] }}>
      <Core quality={quality} {...props} />
    </SceneCanvas>
  );
}