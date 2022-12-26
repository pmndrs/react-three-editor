import { Canvas } from "@react-three/fiber"
import { FC } from "react"
export type ApplicationProps = {}

export const Application: FC<ApplicationProps> = () => {
  return (
    <Canvas>
      <color attach="background" args={["#202020"]} />
      <ambientLight />
      <directionalLight position={[20, 20, 20]} />
      <group>
        <mesh name="Basic Material" position={[0, 0, 0]}>
          <sphereGeometry />
          <meshBasicMaterial />
        </mesh>
        <mesh name="Standard Material" position={[0, 0, 5]}>
          <sphereGeometry />
          <meshStandardMaterial />
        </mesh>
      </group>
      <group>
        <mesh name="Physical Material" position={[0, 0, 10]}>
          <sphereGeometry />
          <meshPhysicalMaterial />
        </mesh>
        <mesh name="Phong Material" position={[0, 0, 15]}>
          <sphereGeometry />
          <meshPhongMaterial />
        </mesh>
      </group>
      <group name="Empty group" position={[0, 0, -5]}>
        {}
      </group>
    </Canvas>
  )
}
