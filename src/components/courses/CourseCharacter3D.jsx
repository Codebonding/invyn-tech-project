import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { buildHuman, disposeRig } from "./humanRig";
import { CAM_Y, CAM_Z, makeState, step } from "./characterController";

function Scene({ phaseRef, getCardRect }) {
  const rig = useMemo(() => buildHuman(), []);
  const state = useMemo(() => makeState(rig), [rig]);
  const ring = useRef(null);
  const shadow = useRef(null);

  useEffect(() => () => disposeRig(rig.root), [rig]);

  useFrame(({ gl }, delta) => {
    step(state, rig, Math.min(delta, 0.05), phaseRef.current, performance.now(), {
      getCanvasRect: () => gl.domElement.getBoundingClientRect(),
      getCardRect,
      ring: ring.current,
      shadow: shadow.current,
    });
  });

  return (
    <>
      <hemisphereLight args={["#8CD6FF", "#132C48", 1.0]} />
      <directionalLight position={[2, 3.2, 3.5]} intensity={2.0} />
      <directionalLight position={[-3, 1.8, -2.5]} intensity={2.4} color="#0B9AF0" />
      <primitive object={rig.root} />
      <mesh ref={shadow} rotation-x={-Math.PI / 2} position={[0, 0.004, 0]}>
        <circleGeometry args={[0.32, 32]} />
        <meshBasicMaterial color="#020b18" transparent opacity={0.35} depthWrite={false} />
      </mesh>
      <mesh ref={ring} visible={false}>
        <ringGeometry args={[0.09, 0.105, 40]} />
        <meshBasicMaterial color="#8CD6FF" transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
    </>
  );
}

/**
 * Transparent real-time 3D canvas. `phase` is the shared interaction phase.
 * `getCardRect` returns the active card's DOMRect so the hand target follows the card.
 */
export default function CourseCharacter3D({ phase, getCardRect, active = true }) {
  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  return (
    <Canvas
      aria-hidden="true"
      frameloop={active ? "always" : "never"}
      dpr={[1, 1.75]}
      gl={{ alpha: true, antialias: true, powerPreference: "low-power" }}
      camera={{ fov: 30, position: [0, CAM_Y, CAM_Z], near: 0.1, far: 30 }}
      onCreated={({ camera }) => camera.lookAt(0, CAM_Y, 0)}
      style={{ pointerEvents: "none" }}
    >
      <Scene phaseRef={phaseRef} getCardRect={getCardRect} />
    </Canvas>
  );
}