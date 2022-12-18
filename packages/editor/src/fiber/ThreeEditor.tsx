import { getDrafter } from "draft-n-draw"
import { levaStore, useControls } from "leva"
import { StoreType } from "leva/dist/declarations/src/types"
import {
  SchemaOrFn,
  usePersistedControls
} from "../editable/controls/usePersistedControls"
import { EditableElement, JSXSource } from "../editable/EditableElement"
import { Editor } from "../editable/Editor"
import { usePanel } from "./usePanel"

// @ts-ignore
levaStore.store = undefined

type Panel = StoreType & { store: StoreType }

export class ThreeEditor extends Editor {
  panels: Record<string, Panel> = {
    default: levaStore as Panel
  }

  getPanel(name: string | StoreType): Panel {
    if (typeof name === "string") {
      if (this.panels[name]) return this.panels[name]

      this.panels[name] = new (Object.getPrototypeOf(levaStore).constructor)()
      // @ts-ignore
      this.panels[name].store = this.panels[name]
      return this.panels[name]
    } else {
      return name as Panel
    }
  }

  get settingsPanel(): StoreType | string {
    return this.store.getState().settingsPanel
  }

  set settingsPanel(arg0: StoreType | string) {
    this.store.setState({
      settingsPanel: arg0
    })
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
    let panel = this.getPanel(this.settingsPanel)
    if (panel.getData()["settings." + arg0]) {
      this.getPanel(this.settingsPanel).setValueAtPath(
        "settings." + arg0,
        arg1,
        false
      )
    }
  }

  useSettings<T extends SchemaOrFn>(
    name: string | undefined,
    arg1: T,
    hidden?: boolean
  ) {
    const settingsPanel = this.store((s) => s.settingsPanel)
    const panel = usePanel(settingsPanel)
    useControls(
      "settings",
      {},
      { collapsed: true, order: 1001 },
      {
        store: panel.store
      }
    )

    let props = usePersistedControls(
      "settings" + (name ? `.${name}` : ""),
      arg1,
      [],
      panel.store,
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

  debug(
    info: any,
    v: {
      persist?: number | boolean | undefined
    } & Omit<Parameters<ReturnType<typeof getDrafter>["drawRay"]>[1], "persist">
  ) {
    let editor = this
    if (typeof v?.persist === "number") {
      let applicable = this.plugins.filter((p) => p.debug && p.applicable(info))

      let dispose = applicable.map((p) => p.debug(info, v, editor))

      setTimeout(() => {
        dispose.forEach((d) => d())
      }, v.persist * 1000)
    } else {
      let dispose = this.plugins
        .filter((p) => p.debug && p.applicable(v))
        .map((p) => p.debug(info, v, editor))
    }
  }

  addPlugin(plugin: {
    applicable: (arg0: any) => boolean
    debug?: (arg0: any, arg1: any, arg2?: ThreeEditor) => () => void
  }) {
    this.plugins.push(plugin)
  }
}
