import { useRef, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Sparkles } from "@react-three/drei";

/**
 * Living hero backdrop: a slowly-breathing distortion sphere wrapped in
 * drei sparkles, with the whole group steering gently toward the mouse.
 */
function Blob() {
  return (
    <Float speed={1.4} rotationIntensity={0.6} floatIntensity={1.2}>
      <mesh>
        <icosahedronGeometry args={[1.35, 64]} />
        <MeshDistortMaterial
          color="#0e5c34"
          emissive="#25D366"
          emissiveIntensity={0.22}
          roughness={0.25}
          metalness={0.55}
          distort={0.42}
          speed={1.6}
          transparent
          opacity={0.92}
        />
      </mesh>
    </Float>
  );
}

function Rig({ children }) {
  const group = useRef();
  useFrame((state, delta) => {
    const { x, y } = state.pointer;
    group.current.rotation.y += (x * 0.25 - group.current.rotation.y) * delta * 1.6;
    group.current.rotation.x += (-y * 0.2 - group.current.rotation.x) * delta * 1.6;
  });
  return <group ref={group}>{children}</group>;
}

export default function HeroScene() {
  return (
    <Canvas
      className="!absolute inset-0"
      dpr={[1, 1.75]}
      camera={{ position: [0, 0, 4.6], fov: 42 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.25} />
        <pointLight position={[4, 4, 4]} intensity={18} color="#25D366" />
        <pointLight position={[-5, -3, 2]} intensity={8} color="#0d9488" />
        <Rig>
          <Blob />
          <Sparkles count={90} scale={[9, 5.5, 4]} size={2.2} speed={0.35} opacity={0.55} color="#7CFFB2" />
        </Rig>
      </Suspense>
    </Canvas>
  );
}
