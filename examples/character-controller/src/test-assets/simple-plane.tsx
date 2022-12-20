export function SimplePlane() {
  return (
    <mesh position={[0, -20, 0]} rotation-x={-Math.PI * 0.5}>
      <planeGeometry args={[5, 5]} />
      <meshBasicMaterial />
    </mesh>
  );
}
