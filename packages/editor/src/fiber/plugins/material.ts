import { Material } from "three"
import { all } from "../prop-types"
import { EditorControlsPlugin } from "../types"

export const material = {
  applicable: (element) => element.ref instanceof Material,
  controls: (element) => {
    return all.material({ element, path: ["ref"] }).schema
  }
} satisfies EditorControlsPlugin
