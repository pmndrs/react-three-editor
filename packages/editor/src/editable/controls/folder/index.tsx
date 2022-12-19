import { LevaPanel } from "leva"
import { StoreType } from "leva/dist/declarations/src/types"
import { createPlugin, useInputContext } from "leva/plugin"
import { useState } from "react"
import { ThreeEditor } from "../../../fiber/ThreeEditor"
import { Collapsible } from "../tree/Collapsible"

export * from "./Folder"
export * from "./FolderTitle"

export const panel = createPlugin<
  {
    store: StoreType
    collapsed: boolean
    onCollapse: (v: boolean) => void
    editor: ThreeEditor
  },
  StoreType,
  {
    collapsed: boolean
    onCollapse: (v: boolean) => void
  }
>({
  normalize({ store, collapsed, onCollapse, editor }) {
    return { value: store, settings: { collapsed, onCollapse, editor } }
  },
  component: () => {
    const input = useInputContext()
    const [collapsed, setCollapsed] = useState()
    return (
      <Collapsible
        title={input.label}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      >
        <LevaPanel
          fill
          titleBar={false}
          flat
          hideCopyButton
          theme={{
            space: {
              rowGap: "2px",
              // md: "6px",
              sm: "4px"
            }
          }}
          store={input.value}
        />
      </Collapsible>
    )
  }
})
