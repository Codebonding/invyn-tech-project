import { Canvas } from "@react-three/fiber";
import { C } from "./helpers";

export function BrandLights() {
  return (
    <>
      <hemisphereLight args={[C.ice, C.navy, 0.9]} />
      <directionalLight position={[3, 4, 5]} intensity={1.3} />
      <directionalLight position={[-4, 2, -3]} intensity={2.0} color={C.blue} />
    </>
  );
}

export default function SceneCanvas({
  children, active = true, eventSource, quality = "high", orthographic = false,
  camera, lookAt = [0, 0, 0], onReady, lights = true,
}) {
  return (
    <Canvas
      frameloop={active ? "always" : "never"}
      dpr={quality === "high" ? [1, 1.75] : [1, 1.25]}
      orthographic={orthographic}
      camera={camera}
      gl={{ alpha: true, antialias: quality !== "low", powerPreference: "low-power" }}
      eventSource={eventSource}
      eventPrefix="client"
      onCreated={({ camera: cam }) => {
        cam.lookAt(...lookAt);
        if (onReady) onReady();
      }}
      style={{ pointerEvents: "none" }}
    >
      {lights && <BrandLights />}
      {children}
    </Canvas>
  );
}