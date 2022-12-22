import { FC, PropsWithChildren } from "react"
import { Canvas } from "@react-three/fiber"

export type ApplicationProps = PropsWithChildren<{}>

export const Application: FC<ApplicationProps> = () => {
  return (
    <Canvas>
      <group />
    </Canvas>
  )
}
