import { Editor } from "../editable/Editor"

export class ThreeEditor extends Editor {
  setRef(element: any, ref: any) {
    if (ref.__r3f) {
      ref.__r3f.editable = element
    }
  }
}
