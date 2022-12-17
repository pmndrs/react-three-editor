import { getDrafter, RayInfo } from "draft-n-draw"
import { Editor } from "../editable/Editor"
export class ThreeEditor extends Editor {
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
