import { StoreType } from "leva/dist/declarations/src/types"
import { Ref } from "react"
import { Object3D } from "three"
import { JSXSource } from "../types"
import { Editor } from "./Editor"

export class EditableElement extends EventTarget {
  props: Record<string, any> = {}
  ref?: Ref<any>
  object?: Object3D
  childIds: string[] = []
  forwardedRef: boolean = false
  store!: StoreType
  editor!: Editor
  index?: string
  constructor(
    public id: string,
    public source: JSXSource,
    public type: any,
    public parentId?: string
  ) {
    super()
  }
}
