import {
  EditableContext,
  EditableElement,
  useEditableContext
} from "@editable-jsx/editable"
import * as React from "react"
import { useId } from "react"
import { editor } from "./editor"
import { useContextBridge } from "./useContextBridge"

// TODO: Fix conditional hook calls.

export function EditorRoot({
  children,
  element,
  ...props
}: {
  children: React.ReactNode
  element?: EditableElement
}) {
  if (element) {
    const ContextBridge = useContextBridge()

    React.useLayoutEffect(() => {
      element.index = "0"
      editor.rootId = element.id
    }, [element])

    editor.ContextBridge = ContextBridge

    return (
      <EditableContext.Provider value={element}>
        {children}
      </EditableContext.Provider>
    )
  } else {
    const ContextBridge = useContextBridge()
    const id = useId()

    // const [editableElement, overrideProps] = editor.useElement("root", {
    //   id: "root" + id,
    //   ...props,
    //   children
    // })

    const editableElement = useEditableContext()

    React.useEffect(() => {
      editableElement.index = "0"
      console.log("setting root")
      editor.rootId = editableElement.id
      editor.store.setState((s) => ({
        elements: { ...s.elements }
      }))
    }, [editableElement])

    editor.ContextBridge = ContextBridge
    return (
      <EditableContext.Provider value={editableElement}>
        {children}
      </EditableContext.Provider>
    )
  }
}
