import { EditableElement } from "../../EditableElement"
import React from "react"
import { StyledIcon } from "../folder/StyledFolder"

export function OpenInEditorButton({ element }: { element: EditableElement }) {
  return (
    <StyledIcon
      icon="pepicons-code"
      onClick={(e) =>
        fetch(
          `/__open-in-editor?file=${encodeURIComponent(
            `${element.source.fileName}:${element.source.lineNumber}:${
              element.source.columnNumber + 1
            }`
          )}`
        )
      }
    />
  )
}
