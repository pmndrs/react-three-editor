import { getDrafter } from "draft-n-draw"
import { levaStore, useControls } from "leva"
import { StoreType } from "leva/dist/declarations/src/types"
import { useState } from "react"
import create from "zustand"
import {
  SchemaOrFn,
  usePersistedControls
} from "../editable/controls/usePersistedControls"
import { EditableElement } from "../editable/EditableElement"
import { Editor } from "../editable/Editor"
import { usePanel } from "./controls/Panel"

const createLevaStore = () => {
  return new (Object.getPrototypeOf(levaStore).constructor)()
}

// @ts-ignore
levaStore.store = undefined

type Panel = StoreType & { store: StoreType }

class PanelManager {}

export class ThreeEditor extends Editor {
  isEditorMode() {
    let enabled = this.getPanel(this.settingsPanel).get(
      "settings.camera.enabled"
    )

    if (enabled === undefined) {
      return false
    } else {
      return enabled
    }
  }
  remount: () => void = () => {}
  isSelected(arg0: EditableElement) {
    return this.store.getState().selectedId === arg0.id
  }

  panelStore = create((get, set) => ({
    panels: {
      default: {
        panel: levaStore as Panel
      }
    } as Record<string, { panel: Panel }>
  }))

  get panels() {
    return this.panelStore.getState().panels
  }

  getPanel(name: string | StoreType): Panel {
    let panels = this.panels
    if (typeof name === "string") {
      if (panels[name]) return panels[name].panel

      panels[name] = { panel: createLevaStore() }

      // @ts-ignore
      panels[name].panel.store = panels[name].panel

      this.panelStore.setState(() => ({
        panels
      }))
      return panels[name].panel
    } else {
      return name as Panel
    }
  }

  hidePanel(name: string) {
    let panels = this.panels
    if (panels[name]) {
      panels[name].hide = true
    }
    this.panelStore.setState(() => ({
      panels
    }))
  }

  settings = createLevaStore()

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
    const settingsPanel = usePanel(this.store((s) => s.settingsPanel))
    const [collapsed, setCollpased] = useState(true)
    useControls(
      "settings",
      {},
      { order: 1001 },
      {
        store: settingsPanel.store
      }
    )

    let props = usePersistedControls(
      `settings` + (name ? `.${name}` : ""),
      arg1,
      [],
      settingsPanel.store,
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

  selectedElement() {
    return this.store.getState().elements[
      this.store.getState().selectedId ?? ""
    ]
  }
}
