import { Suspense, useEffect, useMemo, useRef, useState } from "react";

import { useFrame, useThree } from "@react-three/fiber";

import * as THREE from "three";

import SceneCanvas from "./SceneCanvas";

import {
  C,
  clamp,
  damp,
  disposeAll,
  fibonacciSphere,
  makeBadgeTexture,
  makeGlowTexture,
} from "./helpers";

const ZERO = new THREE.Vector3();

const DIM = new THREE.Color("#1d4f8f");

const BRIGHT = new THREE.Color(C.ice);

const tmp = new THREE.Color();

function TechnologyLogo({ src }) {
  const [texture, setTexture] = useState(null);

  useEffect(() => {
    if (!src) {
      setTexture(null);

      return undefined;
    }

    let cancelled = false;

    let createdTexture = null;

    const image = new Image();

    image.crossOrigin = "anonymous";

    image.onload = () => {
      if (cancelled) return;

      const size = 512;

      const canvas = document.createElement("canvas");

      canvas.width = size;

      canvas.height = size;

      const ctx = canvas.getContext("2d");

      if (!ctx) return;

      ctx.clearRect(0, 0, size, size);

      ctx.save();

      ctx.beginPath();

      ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);

      ctx.clip();

      const scale = Math.max(
        size / image.width,

        size / image.height,
      );

      const width = image.width * scale;

      const height = image.height * scale;

      ctx.drawImage(
        image,

        (size - width) / 2,

        (size - height) / 2,

        width,

        height,
      );

      ctx.restore();

      createdTexture = new THREE.CanvasTexture(canvas);

      createdTexture.colorSpace = THREE.SRGBColorSpace;

      createdTexture.anisotropy = 8;

      createdTexture.needsUpdate = true;

      setTexture(createdTexture);
    };

    image.onerror = () => {
      if (!cancelled) setTexture(null);
    };

    image.src = src;

    return () => {
      cancelled = true;

      image.onload = null;

      image.onerror = null;

      createdTexture?.dispose();
    };
  }, [src]);

  if (!texture) return null;

  return (
    <>
      {/* FRONT LOGO — original position preserved */}

      <mesh position={[0, 0, 0.047]} renderOrder={4}>
        <circleGeometry args={[0.322, 96]} />

        <meshBasicMaterial
          map={texture}
          transparent
          opacity={1}
          depthWrite={false}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>

      {/* BACK LOGO — moved outside the cylinder body */}

      <mesh
        position={[0, 0, -0.095]}
        rotation={[0, Math.PI, 0]}
        renderOrder={4}
      >
        <circleGeometry args={[0.322, 96]} />

        <meshBasicMaterial
          map={texture}
          transparent
          opacity={1}
          depthWrite={false}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>
    </>
  );
}

export function Constellation({
  techs = [],

  activeId = null,

  category: categoryProp = null,

  onHover,

  quality = "high",
}) {
  const category = quality === "low" ? null : categoryProp;

  void category;

  const interactive = quality === "high";

  const list = useMemo(
    () => techs.slice(0, quality === "low" ? 7 : techs.length),

    [techs, quality],
  );

  const aspect = useThree(
    (state) => state.size.width / Math.max(1, state.size.height),
  );

  const ax = Math.round(clamp(aspect * 0.8, 1, 2.6) * 10) / 10;

  const pos = useMemo(
    () =>
      fibonacciSphere(list.length, 2.35).map((v) =>
        v.multiply(new THREE.Vector3(ax, 0.82, 1)),
      ),

    [list.length, ax],
  );

  const tex = useMemo(
    () => ({
      badges: list.map((t) => makeBadgeTexture(t.glyph)),

      glow: makeGlowTexture(),
    }),

    [list],
  );

  /* CONNECTIONS */

  const edges = useMemo(() => {
    const result = [];

    const seen = new Set();

    list.forEach((_, i) => result.push([-1, i]));

    pos.forEach((p, i) => {
      pos

        .map((q, j) => [j, p.distanceTo(q)])

        .filter(([j]) => j !== i)

        .sort((a, b) => a[1] - b[1])

        .slice(0, 2)

        .forEach(([j]) => {
          const key = i < j ? `${i}-${j}` : `${j}-${i}`;

          if (!seen.has(key)) {
            seen.add(key);

            result.push([i, j]);
          }
        });
    });

    return result;
  }, [list, pos]);

  const lineGeo = useMemo(() => {
    const geometry = new THREE.BufferGeometry();

    const positions = new Float32Array(edges.length * 6);

    const colors = new Float32Array(edges.length * 6);

    edges.forEach(([a, b], index) => {
      const A = a < 0 ? ZERO : pos[a];

      const B = pos[b];

      positions.set(
        [A.x, A.y, A.z, B.x, B.y, B.z],

        index * 6,
      );
    });

    geometry.setAttribute(
      "position",

      new THREE.BufferAttribute(positions, 3),
    );

    geometry.setAttribute(
      "color",

      new THREE.BufferAttribute(colors, 3),
    );

    return geometry;
  }, [edges, pos]);

  /* PARTICLES */

  const pulseGeo = useMemo(() => {
    const geometry = new THREE.BufferGeometry();

    geometry.setAttribute(
      "position",

      new THREE.BufferAttribute(
        new Float32Array(list.length * 3),

        3,
      ),
    );

    return geometry;
  }, [list.length]);

  useEffect(() => {
    return () => {
      disposeAll(tex.badges, tex.glow, lineGeo, pulseGeo);
    };
  }, [tex, lineGeo, pulseGeo]);

  /* REFERENCES */

  const group = useRef(null);

  const nodes = useRef([]);

  const orbitRings = useRef([]);

  const hover = useRef(-1);

  const st = useRef({
    spin: 0,

    ox: 0,

    oy: 0,

    lift: [],

    level: [],
  });

  /* =========================================================

     ANIMATION LOOP

  ========================================================= */

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

    state.camera.position.x = damp(
      state.camera.position.x,

      px * 0.35,

      2,

      dt,
    );

    state.camera.position.y = damp(
      state.camera.position.y,

      py * 0.25,

      2,

      dt,
    );

    state.camera.lookAt(0, 0, 0);

    const activeIndex =
      hover.current >= 0
        ? hover.current
        : list.findIndex((t) => t.id === activeId);

    /* Hover lift and scale */

    list.forEach((_, i) => {
      s.lift[i] = damp(
        s.lift[i] ?? 0,

        i === activeIndex ? 1 : 0,

        8,

        dt,
      );

      const node = nodes.current[i];

      if (node) {
        const lift = s.lift[i];
        const spread = 1 + 0.16 * lift;
        node.position.set(
          pos[i].x * spread,
          pos[i].y * spread,
          pos[i].z * spread,
        );
        node.scale.setScalar(1 + 0.35 * lift);
      }
      const orbit = orbitRings.current[i];

      if (orbit) {
        orbit.rotation.z += dt * (i % 2 === 0 ? 0.42 : -0.32);

        orbit.rotation.z += dt * s.lift[i] * 0.5;
      }
    });

    /* Connection colors */

    const colors = lineGeo.attributes.color;

    edges.forEach(([a, b], index) => {
      const target =
        a === activeIndex || b === activeIndex ? 1 : a < 0 ? 0.45 : 0.18;

      s.level[index] = damp(
        s.level[index] ?? 0.18,

        target,

        6,

        dt,
      );

      tmp.copy(DIM).lerp(BRIGHT, s.level[index]);

      colors.setXYZ(index * 2, tmp.r, tmp.g, tmp.b);

      colors.setXYZ(index * 2 + 1, tmp.r, tmp.g, tmp.b);
    });

    colors.needsUpdate = true;

    /* Traveling particles */

    const pulsePositions = pulseGeo.attributes.position;

    const time = state.clock.elapsedTime;

    list.forEach((_, i) => {
      const f = (time * (i === activeIndex ? 0.7 : 0.3) + i * 0.137) % 1;

      pulsePositions.setXYZ(
        i,

        pos[i].x * f,

        pos[i].y * f,

        pos[i].z * f,
      );
    });

    pulsePositions.needsUpdate = true;
  });

  /* =========================================================

     SCENE

  ========================================================= */

  return (
    <group ref={group} scale={0.78}>
      {/* CENTRAL 3D CORE */}

      <mesh>
        <icosahedronGeometry args={[0.42, 1]} />

        <meshStandardMaterial
          color={C.blue}
          emissive={C.blue}
          emissiveIntensity={1.3}
          roughness={0.3}
          metalness={0.55}
        />
      </mesh>

      <mesh>
        <icosahedronGeometry args={[0.64, 1]} />

        <meshBasicMaterial color={C.ice} wireframe transparent opacity={0.35} />
      </mesh>

      {/* CENTRAL GLOW */}

      <sprite scale={[3, 3, 1]}>
        <spriteMaterial
          map={tex.glow}
          color={C.blue}
          transparent
          opacity={0.7}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </sprite>

      {/* CONNECTION LINES */}

      <lineSegments geometry={lineGeo}>
        <lineBasicMaterial
          vertexColors
          transparent
          opacity={0.9}
          depthWrite={false}
        />
      </lineSegments>

      {/* PARTICLES */}

      <points geometry={pulseGeo}>
        <pointsMaterial
          color={C.ice}
          size={0.11}
          sizeAttenuation
          transparent
          opacity={0.95}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* TECHNOLOGY NODES */}

      {list.map((t, i) => (
        <group
          key={t.id}
          ref={(el) => {
            nodes.current[i] = el;
          }}
          position={pos[i]}
        >
          {/* OUTER GLOW */}

          <mesh position={[0, 0, -0.055]} renderOrder={0}>
            <circleGeometry args={[0.49, 96]} />

            <meshBasicMaterial
              color="#0B9AF0"
              transparent
              opacity={0.14}
              depthWrite={false}
              side={THREE.DoubleSide}
              blending={THREE.AdditiveBlending}
              toneMapped={false}
            />
          </mesh>

          <sprite
            position={[0, 0, -0.045]}
            scale={[1.08, 1.08, 1]}
            renderOrder={0}
          >
            <spriteMaterial
              map={tex.glow}
              color="#0B9AF0"
              transparent
              opacity={0.42}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
              toneMapped={false}
            />
          </sprite>

          {/* THICK 3D CYLINDRICAL BODY */}

          <mesh
            position={[0, 0, -0.025]}
            rotation={[Math.PI / 2, 0, 0]}
            renderOrder={1}
          >
            <cylinderGeometry args={[0.385, 0.385, 0.12, 96]} />

            <meshStandardMaterial
              color="#07346B"
              emissive="#031F94"
              emissiveIntensity={0.8}
              metalness={0.9}
              roughness={0.24}
            />
          </mesh>

          {/* FRONT DARK INSET */}

          <mesh position={[0, 0, 0.039]} renderOrder={2}>
            <circleGeometry args={[0.335, 96]} />

            <meshBasicMaterial
              color="#071C3A"
              depthWrite={false}
              side={THREE.DoubleSide}
              toneMapped={false}
            />
          </mesh>

          {/* TECHNOLOGY IMAGE ON BOTH SIDES */}

          {t.image || t.logo ? (
            <Suspense fallback={null}>
              <TechnologyLogo src={t.image || t.logo} />
            </Suspense>
          ) : (
            <>
              {/* FRONT GLYPH */}

              <mesh position={[0, 0, 0.047]} renderOrder={4}>
                <circleGeometry args={[0.322, 96]} />

                <meshBasicMaterial
                  map={tex.badges[i]}
                  transparent
                  depthWrite={false}
                  side={THREE.DoubleSide}
                  toneMapped={false}
                />
              </mesh>

              {/* BACK GLYPH */}

              <mesh
                position={[0, 0, -0.095]}
                rotation={[0, Math.PI, 0]}
                renderOrder={4}
              >
                <circleGeometry args={[0.322, 96]} />

                <meshBasicMaterial
                  map={tex.badges[i]}
                  transparent
                  depthWrite={false}
                  side={THREE.DoubleSide}
                  toneMapped={false}
                />
              </mesh>
            </>
          )}

          {/* FRONT BLUE BEZEL */}

          <mesh position={[0, 0, 0.055]} renderOrder={5}>
            <ringGeometry args={[0.345, 0.395, 96]} />

            <meshBasicMaterial
              color="#0B9AF0"
              transparent
              opacity={1}
              depthWrite={false}
              side={THREE.DoubleSide}
              toneMapped={false}
            />
          </mesh>

          {/* BACK BLUE BEZEL */}

          <mesh
            position={[0, 0, -0.055]}
            rotation={[0, Math.PI, 0]}
            renderOrder={5}
          >
            <ringGeometry args={[0.345, 0.395, 96]} />

            <meshBasicMaterial
              color="#0B9AF0"
              transparent
              opacity={1}
              depthWrite={false}
              side={THREE.DoubleSide}
              toneMapped={false}
            />
          </mesh>

          {/* FRONT ICE-BLUE HIGHLIGHT */}

          <mesh position={[0, 0, 0.06]} renderOrder={6}>
            <ringGeometry args={[0.326, 0.338, 96]} />

            <meshBasicMaterial
              color="#8CD6FF"
              transparent
              opacity={1}
              depthWrite={false}
              side={THREE.DoubleSide}
              toneMapped={false}
            />
          </mesh>

          {/* BACK ICE-BLUE HIGHLIGHT */}

          <mesh
            position={[0, 0, -0.06]}
            rotation={[0, Math.PI, 0]}
            renderOrder={6}
          >
            <ringGeometry args={[0.326, 0.338, 96]} />

            <meshBasicMaterial
              color="#8CD6FF"
              transparent
              opacity={1}
              depthWrite={false}
              side={THREE.DoubleSide}
              toneMapped={false}
            />
          </mesh>

          {/* FRONT OUTER OUTLINE */}

          <mesh position={[0, 0, 0.008]} renderOrder={2}>
            <ringGeometry args={[0.415, 0.423, 96]} />

            <meshBasicMaterial
              color="#0B9AF0"
              transparent
              opacity={0.85}
              depthWrite={false}
              side={THREE.DoubleSide}
              toneMapped={false}
            />
          </mesh>

          {/* BACK OUTER OUTLINE */}

          <mesh
            position={[0, 0, -0.008]}
            rotation={[0, Math.PI, 0]}
            renderOrder={2}
          >
            <ringGeometry args={[0.415, 0.423, 96]} />

            <meshBasicMaterial
              color="#0B9AF0"
              transparent
              opacity={0.85}
              depthWrite={false}
              side={THREE.DoubleSide}
              toneMapped={false}
            />
          </mesh>

          {/* ROTATING ORBITAL ACCENT */}

          <mesh
            ref={(el) => {
              orbitRings.current[i] = el;
            }}
            position={[0, 0, -0.065]}
            renderOrder={1}
          >
            <ringGeometry args={[0.445, 0.452, 96, 1, 0, Math.PI * 1.35]} />

            <meshBasicMaterial
              color="#8CD6FF"
              transparent
              opacity={0.95}
              depthWrite={false}
              side={THREE.DoubleSide}
              toneMapped={false}
            />
          </mesh>

          {/* SECOND ORBITAL ACCENT */}

          <mesh
            position={[0, 0, -0.07]}
            rotation={[0, 0, Math.PI * 0.75]}
            renderOrder={1}
          >
            <ringGeometry args={[0.46, 0.464, 96, 1, 0, Math.PI * 0.38]} />

            <meshBasicMaterial
              color="#0B9AF0"
              transparent
              opacity={0.75}
              depthWrite={false}
              side={THREE.DoubleSide}
              toneMapped={false}
            />
          </mesh>

          {/* HOVER INTERACTION */}

          {interactive && (
            <mesh
              position={[0, 0, 0.07]}
              onPointerOver={(e) => {
                e.stopPropagation();

                hover.current = i;

                onHover?.(t.id);
              }}
              onPointerOut={(e) => {
                e.stopPropagation();

                if (hover.current === i) {
                  hover.current = -1;

                  onHover?.(null);
                }
              }}
            >
              <circleGeometry args={[0.43, 48]} />
              <meshBasicMaterial
                transparent
                opacity={0}
                depthWrite={false}
                side={THREE.DoubleSide}
              />
            </mesh>
          )}
        </group>
      ))}
    </group>
  );
}
export default function TechnologyConstellation({
  quality,
  active,
  eventSource,
  onReady,
  ...props
}) {
  return (
    <SceneCanvas
      quality={quality}
      active={active}
      eventSource={eventSource}
      onReady={onReady}
      camera={{
        fov: 38,

        position: [0, 0, 8.4],
      }}
    >
      <Constellation quality={quality} {...props} />
    </SceneCanvas>
  );
}