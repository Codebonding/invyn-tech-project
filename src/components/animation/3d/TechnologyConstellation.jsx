import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import SceneCanvas from "./SceneCanvas";
import { C, damp, disposeAll, fibonacciSphere, makeBadgeTexture, makeGlowTexture, makeLabelTexture } from "./helpers";

const ZERO = new THREE.Vector3();
const DIM = new THREE.Color("#1d4f8f");
const BRIGHT = new THREE.Color(C.ice);
const tmp = new THREE.Color();

export function Constellation({ techs, activeId = null, onHover, quality = "high" }) {
  const interactive = quality === "high";
  const list = useMemo(() => techs.slice(0, quality === "low" ? 7 : techs.length), [techs, quality]);
  const pos = useMemo(
    () => fibonacciSphere(list.length, 2.35).map((v) => v.multiply(new THREE.Vector3(1, 0.82, 1))),
    [list.length]
  );
  const tex = useMemo(
    () => ({ badges: list.map((t) => makeBadgeTexture(t.glyph)), labels: list.map((t) => makeLabelTexture(t.name)), glow: makeGlowTexture() }),
    [list]
  );

  const edges = useMemo(() => {
    const e = [];
    const seen = new Set();
    list.forEach((_, i) => e.push([-1, i]));
    pos.forEach((p, i) => {
      pos
        .map((q, j) => [j, p.distanceTo(q)])
        .filter(([j]) => j !== i)
        .sort((a, b) => a[1] - b[1])
        .slice(0, 2)
        .forEach(([j]) => {
          const k = i < j ? `${i}-${j}` : `${j}-${i}`;
          if (!seen.has(k)) { seen.add(k); e.push([i, j]); }
        });
    });
    return e;
  }, [list, pos]);

  const lineGeo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const p = new Float32Array(edges.length * 6);
    edges.forEach(([a, b], k) => {
      const A = a < 0 ? ZERO : pos[a];
      const B = pos[b];
      p.set([A.x, A.y, A.z, B.x, B.y, B.z], k * 6);
    });
    g.setAttribute("position", new THREE.BufferAttribute(p, 3));
    g.setAttribute("color", new THREE.BufferAttribute(new Float32Array(edges.length * 6), 3));
    return g;
  }, [edges, pos]);
  const pulseGeo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(list.length * 3), 3));
    return g;
  }, [list.length]);

  useEffect(() => () => disposeAll(tex.badges, tex.labels, tex.glow, lineGeo, pulseGeo), [tex, lineGeo, pulseGeo]);

  const group = useRef(null);
  const nodes = useRef([]);
  const labelMats = useRef([]);
  const hover = useRef(-1);
  const st = useRef({ spin: 0, ox: 0, oy: 0, lift: [], level: [] });

  useFrame((state, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const s = st.current;
    const px = interactive ? state.pointer.x : 0;
    const py = interactive ? state.pointer.y : 0;

    s.spin += dt * 0.1;
    s.ox = damp(s.ox, px * 0.45, 3, dt);
    s.oy = damp(s.oy, -py * 0.22, 3, dt);
    if (group.current) {
      group.current.rotation.y = s.spin + s.ox;
      group.current.rotation.x = 0.14 + s.oy;
    }
    state.camera.position.x = damp(state.camera.position.x, px * 0.35, 2, dt);
    state.camera.position.y = damp(state.camera.position.y, py * 0.25, 2, dt);
    state.camera.lookAt(0, 0, 0);

    const ai = hover.current >= 0 ? hover.current : list.findIndex((t) => t.id === activeId);

    list.forEach((_, i) => {
      s.lift[i] = damp(s.lift[i] ?? 0, i === ai ? 1 : 0, 8, dt);
      const n = nodes.current[i];
      if (n) {
        const k = 1 + 0.16 * s.lift[i];
        n.position.set(pos[i].x * k, pos[i].y * k, pos[i].z * k);
        n.scale.setScalar(1 + 0.35 * s.lift[i]);
      }
      const lm = labelMats.current[i];
      if (lm) lm.opacity = s.lift[i];
    });

    const col = lineGeo.attributes.color;
    edges.forEach(([a, b], k) => {
      const target = a === ai || b === ai ? 1 : a < 0 ? 0.45 : 0.18;
      s.level[k] = damp(s.level[k] ?? 0.18, target, 6, dt);
      tmp.copy(DIM).lerp(BRIGHT, s.level[k]);
      col.setXYZ(k * 2, tmp.r, tmp.g, tmp.b);
      col.setXYZ(k * 2 + 1, tmp.r, tmp.g, tmp.b);
    });
    col.needsUpdate = true;

    const pp = pulseGeo.attributes.position;
    const t = state.clock.elapsedTime;
    list.forEach((_, i) => {
      const f = (t * (i === ai ? 0.7 : 0.3) + i * 0.137) % 1;
      pp.setXYZ(i, pos[i].x * f, pos[i].y * f, pos[i].z * f);
    });
    pp.needsUpdate = true;
  });

  return (
    <group ref={group}>
      <mesh>
        <icosahedronGeometry args={[0.42, 1]} />
        <meshStandardMaterial color={C.blue} emissive={C.blue} emissiveIntensity={1.3} roughness={0.3} />
      </mesh>
      <mesh>
        <icosahedronGeometry args={[0.64, 1]} />
        <meshBasicMaterial color={C.ice} wireframe transparent opacity={0.35} />
      </mesh>
      <sprite scale={[3, 3, 1]}>
        <spriteMaterial map={tex.glow} color={C.blue} transparent opacity={0.7} depthWrite={false} blending={THREE.AdditiveBlending} />
      </sprite>

      <lineSegments geometry={lineGeo}>
        <lineBasicMaterial vertexColors transparent opacity={0.9} depthWrite={false} />
      </lineSegments>
      <points geometry={pulseGeo}>
        <pointsMaterial color={C.ice} size={0.11} sizeAttenuation transparent opacity={0.95} depthWrite={false} blending={THREE.AdditiveBlending} />
      </points>

      {list.map((t, i) => (
        <group key={t.id} ref={(el) => { nodes.current[i] = el; }} position={pos[i]}>
          <sprite scale={[0.66, 0.66, 1]}>
            <spriteMaterial map={tex.badges[i]} transparent depthWrite={false} />
          </sprite>
          <sprite position={[0, 0.58, 0]} scale={[0.34 * (tex.labels[i]?.userData.aspect ?? 3), 0.34, 1]}>
            <spriteMaterial ref={(m) => { labelMats.current[i] = m; }} map={tex.labels[i]} transparent opacity={0} depthWrite={false} />
          </sprite>
          {interactive && (
            <mesh
              onPointerOver={(e) => { e.stopPropagation(); hover.current = i; if (onHover) onHover(t.id); }}
              onPointerOut={() => { hover.current = -1; if (onHover) onHover(null); }}
            >
              <sphereGeometry args={[0.34, 10, 10]} />
              <meshBasicMaterial transparent opacity={0} depthWrite={false} />
            </mesh>
          )}
        </group>
      ))}
    </group>
  );
}

export default function TechnologyConstellation({ quality, active, eventSource, onReady, ...props }) {
  return (
    <SceneCanvas quality={quality} active={active} eventSource={eventSource} onReady={onReady} camera={{ fov: 38, position: [0, 0, 8.4] }}>
      <Constellation quality={quality} {...props} />
    </SceneCanvas>
  );
}