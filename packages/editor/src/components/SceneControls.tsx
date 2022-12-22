import { useControls } from "leva"
import { FC } from "react"
import { usePanel } from "./Panel"

export type SceneControlsProps = {
  store?: string
}
export const SceneControls: FC<SceneControlsProps> = ({ store = "scene" }) => {
  const panel = usePanel(store)
  useControls(
    {
      scene: {
        value: 0
      }
    },
    { store: panel.store }
  )
  return null
}
