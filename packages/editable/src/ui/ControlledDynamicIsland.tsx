import { multiToggle } from "@editable-jsx/ui"
import { useEditor } from "../useEditor"
import { DynamicIsland } from "./BottomBar"

export function ControlledDynamicIsland() {
  const editor = useEditor()
  const { placement, side, hidden } = editor.useSettings("panels.island", {
    placement: multiToggle({
      data: "bottom",
      options: ["top", "bottom"] as const
    }),
    side: multiToggle({
      data: "center",
      options: ["left", "center", "right"] as const
    }),
    hidden: false
  })

  return <DynamicIsland placement={placement} side={side} hidden={hidden} />
}
