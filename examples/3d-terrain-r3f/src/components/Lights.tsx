import { useRef } from "react";
import { useHelper } from "@react-three/drei";
import { DirectionalLight, DirectionalLightHelper } from "three";

export function Lights() {
  const ref = useRef<DirectionalLight>(null);

  // useHelper(ref, DirectionalLightHelper);

  return (
    <group>
      <hemisphereLight args={["white", "darkslategrey", 0.4]} />
      <directionalLight
        ref={ref}
        castShadow
        position={[-5, 3, -5]}
        intensity={2.5}
        shadowBias={-0.0002}
        color="orange"
      />
      <directionalLight position={[1, 1, 1]} intensity={0.3} />
    </group>
  );
}
