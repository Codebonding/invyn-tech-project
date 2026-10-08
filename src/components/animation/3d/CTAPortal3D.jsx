import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import SceneCanvas from "./SceneCanvas";
import { C, clamp, damp, disposeAll, easeOut, makeGlowTexture } from "./helpers";

const RINGS = [
  { r: 1.95, tube: 0.045, color: C.blue, speed: 0.25, start: 0.4 },
  { r: 1.5, tube: 0.032, color: C.royal, speed: -0.38, start: 0.9 },
  { r: 1.05, tube: 0.026, color: C.ice, speed: 0.55, start: 1.3 },
];

export function Portal({ hotRef, quality = "high" }) {
  const interactive = quality === "high";
  const N = quality === "low" ? 100 : 260;
  const glow = useMemo(() => makeGlowTexture(), []);
  const data = useMemo(
    () => Array.from({ length: N }, () => ({ a: Math.random() * Math.PI * 2, r: 0.3 + Math.random() * 3.2, z: (Math.random() - 0.5) * 1.2, v: 0.6 + Math.random() * 0.8 })),
    [N]
  );
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(N * 3), 3));
    return g;
  }, [N]);
  const ringMats = useMemo(() => RINGS.map((r) => new THREE.MeshStandardMaterial({ color: r.color, emissive: r.color, emissiveIntensity: 1, transparent: true, opacity: 0, roughness: 0.25 })), []);
  useEffect(() => () => disposeAll(glow, geo, ringMats), [glow, geo, ringMats]);

  const group = useRef(null);
  const ringRefs = useRef([]);
  const discMat = useRef(null);
  const coreSprite = useRef(null);
  const partMat = useRef(null);
  const light = useRef(null);
  const st = useRef({ t0: null, hot: 0, ox: 0, oy: 0 });

  useFrame((state, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const t = state.clock.elapsedTime;
    const s = st.current;
    if (s.t0 === null) s.t0 = t;
    const age = t - s.t0;

    s.hot = damp(s.hot, hotRef && hotRef.current ? 1 : 0, 4, dt);
    const px = interactive ? state.pointer.x : 0;
    const py = interactive ? state.pointer.y : 0;
    s.ox = damp(s.ox, px, 3, dt);
    s.oy = damp(s.oy, py, 3, dt);

    state.camera.position.set(s.ox * 0.4, s.oy * 0.25, 7.5 + Math.sin(t * 0.3) * 0.15 - s.hot * 0.35);
    state.camera.lookAt(0, 0, 0);
    if (group.current) {
      group.current.rotation.y = s.ox * 0.25;
      group.current.rotation.x = -s.oy * 0.18;
    }

    const lightE = easeOut(age / 0.6);
    if (coreSprite.current) {
      const sc = (0.5 + 2.4 * lightE) * (1 + s.hot * 0.3);
      coreSprite.current.scale.set(sc, sc, 1);
      coreSprite.current.material.opacity = (0.55 + s.hot * 0.35) * lightE;
    }
    RINGS.forEach((r, i) => {
      const e = easeOut((age - r.start) / 0.7);
      const g = ringRefs.current[i];
      if (g) { g.scale.setScalar(0.3 + 0.7 * e); g.rotation.z += dt * r.speed * (1 + s.hot); }
      ringMats[i].opacity = e;
      ringMats[i].emissiveIntensity = 1 + s.hot * 1.2;
    });
    if (discMat.current) discMat.current.opacity = easeOut((age - 1.4) / 0.8) * (0.4 + s.hot * 0.25);
    const energy = easeOut((age - 1.6) / 0.8);
    if (partMat.current) partMat.current.opacity = 0.9 * energy;

    const pos = geo.attributes.position;
    const speed = (0.5 + s.hot * 1.3) * dt;
    for (let i = 0; i < N; i++) {
      const d = data[i];
      d.r -= d.v * speed;
      d.a += (1.2 / (d.r + 0.6)) * speed;
      if (d.r < 0.18) { d.r = 3.2 + Math.random() * 0.8; d.a = Math.random() * Math.PI * 2; }
      pos.setXYZ(i, Math.cos(d.a) * d.r, Math.sin(d.a) * d.r * 0.82, d.z * (d.r / 3.4));
    }
    pos.needsUpdate = true;

    if (light.current) {
      light.current.position.x = damp(light.current.position.x, s.ox * 2.4, 4, dt);
      light.current.position.y = damp(light.current.position.y, s.oy * 1.4, 4, dt);
      light.current.intensity = clamp(lightE * (5 + s.hot * 8), 0, 14);
    }
  });

  return (
    <group ref={group}>
      <pointLight ref={light} position={[0, 0, 2.2]} color={C.ice} intensity={0} distance={9} />
      <sprite ref={coreSprite} scale={[0.5, 0.5, 1]}>
        <spriteMaterial map={glow} color={C.ice} transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} />
      </sprite>
      <mesh position-z={-0.05}>
        <circleGeometry args={[1.4, 48]} />
        <meshBasicMaterial ref={discMat} color={C.blue} transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      {RINGS.map((r, i) => (
        <group key={r.r} ref={(el) => { ringRefs.current[i] = el; }} position-z={-i * 0.12}>
          <mesh material={ringMats[i]}><torusGeometry args={[r.r, r.tube, 12, 96]} /></mesh>
          <mesh material={ringMats[i]} rotation-x={0.5} scale={0.96}><torusGeometry args={[r.r, r.tube * 0.4, 8, 72, Math.PI * 1.2]} /></mesh>
        </group>
      ))}
      <points geometry={geo}>
        <pointsMaterial ref={partMat} color={C.ice} size={0.055} sizeAttenuation transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} />
      </points>
    </group>
  );
}

export default function CTAPortal3D({ quality, active, eventSource, onReady, ...props }) {
  return (
    <SceneCanvas quality={quality} active={active} eventSource={eventSource} onReady={onReady} camera={{ fov: 34, position: [0, 0, 7.5] }}>
      <Portal quality={quality} {...props} />
    </SceneCanvas>
  );
}