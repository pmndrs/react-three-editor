import { useBounds } from "@react-three/drei"
// import { getDrafter } from "draft-n-draw"
import { levaStore } from "leva"
import { useCallback } from "react"
import { Editor } from "../editable/Editor"

// @ts-ignore
levaStore.store = undefined

export class ThreeEditor extends Editor {
  findEditableElement(obj: any) {
    return obj?.__r3f?.editable
  }
  setMode(value: any) {
    this.getPanel(this.settingsPanel).set({ "world.mode": value }, true)
    switch (value) {
      case "editor":
        this.remount()
    }
  }
  camera: unknown
  bounds!: ReturnType<typeof useBounds>
  isEditorMode() {
    let enabled =
      this.getPanel(this.settingsPanel).get("world.mode") === "editor"

    return enabled
  }

  useElement(Component: any, props: any, forwardRef?: any): [any, any] {
    let [element, overrideProps] = super.useElement(
      Component,
      props,
      forwardRef
    )

    return [
      element,
      {
        ...overrideProps,
        onPointerUp: useCallback(
          (e: any) => {
            props.onPointerDown?.(e)
            let id = element.id
            e.stopPropagation()
            if (!element.editor.selectedElement) {
              element.editor.selectId(id)
            }
          },
          [element]
        )
      }
    ]
  }

  // drafter = getDrafter()

  setRef(element: any, ref: any) {
    if (ref.__r3f) {
      ref.__r3f.editable = element
    }
  }

  // debug(
  //   info: any,
  //   v: {
  //     persist?: number | boolean | undefined
  //   } & Omit<Parameters<ReturnType<typeof getDrafter>["drawRay"]>[1], "persist">
  // ) {
  //   let editor = this
  //   if (!this.isEditorMode()) return
  //   if (typeof v?.persist === "number") {
  //     let applicable = this.plugins.filter((p) => p.debug && p.applicable(info))

  //     let dispose = applicable.map((p) => p.debug(info, v, editor))

  //     setTimeout(() => {
  //       dispose.forEach((d) => d())
  //     }, v.persist * 1000)
  //   } else {
  //     let dispose = this.plugins
  //       .filter((p) => p.debug && p.applicable(v))
  //       .map((p) => p.debug(info, v, editor))
  //   }
  // }
}
