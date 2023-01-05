import { FC } from "react"

export type BoxMeshProps = {}

export const BoxMesh: FC<BoxMeshProps> = () => {
  return (
    <group>
      <mesh>
        <boxGeometry />
        <meshStandardMaterial color={"magenta"} />
      </mesh>
    </group>
  )
}
