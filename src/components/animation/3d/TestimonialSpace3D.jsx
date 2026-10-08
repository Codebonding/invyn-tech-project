import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import SceneCanvas from "./SceneCanvas";
import { C, damp, disposeAll } from "./helpers";

export function Space({ index = 0, count = 1, quality = "high" }) {
  const interactive = quality === "high";
  const layers = useMemo(() => {
    const n = quality === "low" ? 35 : 70;
    return [-1, -3, -5].map((z) => {
      const g = new THREE.BufferGeometry();
      const p = new Float32Array(n * 3);
      for (let i = 0; i < n; i++) p.set([(Math.random() - 0.5) * 16, (Math.random() - 0.5) * 7, z + (Math.random() - 0.5)], i * 3);
      g.setAttribute("position", new THREE.BufferAttribute(p, 3));
      return g;
    });
  }, [quality]);
  const plateEdges = useMemo(() => new THREE.EdgesGeometry(new THREE.PlaneGeometry(3, 1.8)), []);
  useEffect(() => () => disposeAll(layers, plateEdges), [layers, plateEdges]);

  const root = useRef(null);
  const layerRefs = useRef([]);
  const st = useRef({ x: 0, ox: 0, oy: 0 });

  useFrame((state, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const s = st.current;
    const t = state.clock.elapsedTime;
    const px = interactive ? state.pointer.x : 0;
    const py = interactive ? state.pointer.y : 0;
    s.ox = damp(s.ox, px, 2.5, dt);
    s.oy = damp(s.oy, py, 2.5, dt);
    s.x = damp(s.x, count > 1 ? -(index - (count - 1) / 2) * 0.55 : 0, 3, dt);
    state.camera.position.x = s.ox * 0.5;
    state.camera.position.y = s.oy * 0.3;
    state.camera.lookAt(0, 0, 0);
    layerRefs.current.forEach((g, i) => {
      if (!g) return;
      g.position.x = s.x * (i + 1) * 0.6;
      g.rotation.z = Math.sin(t * 0.08 + i) * 0.03;
    });
    if (root.current) root.current.rotation.y = s.ox * 0.06;
  });

  return (
    <group ref={root}>
      {layers.map((g, i) => (
        <group key={i} ref={(el) => { layerRefs.current[i] = el; }}>
          <points geometry={g}>
            <pointsMaterial color={i === 0 ? C.ice : C.blue} size={0.05 + i * 0.012} sizeAttenuation transparent opacity={0.65 - i * 0.12} depthWrite={false} blending={THREE.AdditiveBlending} />
          </points>
        </group>
      ))}
      {[-4.2, -2.1, 0, 2.1, 4.2].map((x, i) => (
        <group key={x} position={[x, Math.sin(i) * 0.15, -2.4 - Math.abs(x) * 0.18]} rotation-y={-x * 0.07}>
          <mesh>
            <planeGeometry args={[3, 1.8]} />
            <meshBasicMaterial color={C.blue} transparent opacity={0.04} depthWrite={false} />
          </mesh>
          <lineSegments geometry={plateEdges}>
            <lineBasicMaterial color={C.ice} transparent opacity={0.22} />
          </lineSegments>
        </group>
      ))}
    </group>
  );
}

export default function TestimonialSpace3D({ quality, active, eventSource, onReady, ...props }) {
  return (
    <SceneCanvas quality={quality} active={active} eventSource={eventSource} onReady={onReady} camera={{ fov: 24, position: [0, 0, 10] }}>
      <Space quality={quality} {...props} />
    </SceneCanvas>
  );
}