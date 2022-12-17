import { getDrafter, RayInfo } from "draft-n-draw"
import { useControls, useCreateStore } from "leva"
import { StoreType } from "leva/dist/declarations/src/types"
import {
  SchemaOrFn,
  usePersistedControls
} from "../editable/controls/usePersistedControls"
import { EditableElement, JSXSource } from "../editable/EditableElement"
import { Editor } from "../editable/Editor"

export class ThreeEditor extends Editor {
  panels: Record<string, StoreType> = {}
  usePanel(name: string) {
    if (this.panels[name]) return this.panels[name]
    const store = useCreateStore()

    this.panels[name] = store
    return store
  }

  selectKey(arg0: any) {
    if (!arg0) {
      return
    }
    // let element = this.store.getState().elements[id]
    this.store.setState({
      selectedKey: arg0
      // selectedKey: element.key
    })
  }
  setSettings(arg0: string, arg1: any) {
    this.panels["scene"].setValueAtPath("settings." + arg0, arg1, false)
  }

  useSettings<T extends SchemaOrFn>(
    name: string | undefined,
    arg1: T,
    hidden?: boolean
  ) {
    useControls(
      "settings",
      {},
      { collapsed: true, order: 1001 },
      {
        store: this.usePanel("scene")
      }
    )

    let props = usePersistedControls(
      "settings" + (name ? `.${name}` : ""),
      arg1,
      [],
      this.usePanel("scene"),
      hidden
    )

    return props
  }

  createElement(
    id: string,
    source: JSXSource,
    componentType: string | import("react").FC<{}>
  ): any {
    let element = new EditableElement(id, source, componentType)
    element.editor = this
    return element
  }

  drafter = getDrafter()

  setRef(element: any, ref: any) {
    if (ref.__r3f) {
      ref.__r3f.editable = element
    }
  }

  debugRay(
    info: RayInfo,
    v: {
      persist?: number | boolean | undefined
    } & Omit<Parameters<ReturnType<typeof getDrafter>["drawRay"]>[1], "persist">
  ) {
    if (typeof v?.persist === "number") {
      this.drafter.drawRay(info, v as any)
      setTimeout(() => {
        this.drafter.dispose(info)
      }, v.persist * 1000)
    } else {
      this.drafter.drawRay(info, v as any)
    }
  }
}
