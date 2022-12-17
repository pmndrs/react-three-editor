import { getDrafter, RayInfo } from "draft-n-draw"
import { EditableElement, JSXSource } from "../editable/EditableElement"
import { Editor } from "../editable/Editor"

export class ThreeEditor extends Editor {
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
