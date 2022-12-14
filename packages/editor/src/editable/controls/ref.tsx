import { Components, createPlugin, useInputContext } from "leva/plugin"
import React, { useCallback } from "react"
import { EditableElement } from "../EditableElement"
import { StyledFolder, StyledTitle } from "./folder/StyledFolder"
import { ElementIcon } from "./tree/ElementIcon"
import { OpenInEditorButton } from "./tree/OpenInEditorButton"

export function ElementRef({ element }: { element: EditableElement }) {

  const onClick = useCallback(() => {
    element.editor.select( element )
  }, [])

  return (
    <>
      <ElementIcon element={element} />
      <div
        style={{ marginLeft: "4px" }}
        onClick={onClick}
      >
        {element.displayName}
      </div>
      <div style={{ marginLeft: "auto" }} />
      <OpenInEditorButton element={element} />
    </>
  )
}

export const ref = createPlugin({
  component: () => {
    const context = useInputContext<{ value: EditableElement }>()

    if (!context.value) {
      return (
        <Components.Row input>
          <Components.Label>{context.key}</Components.Label>
          <StyledFolder>
            <StyledTitle>
              {/* <ElementRef element={context.value} key={context.value.id} /> */}
            </StyledTitle>
          </StyledFolder>
        </Components.Row>
      )
    }
    return (
      <Components.Row input>
        <Components.Label>{context.key}</Components.Label>
        <StyledFolder>
          <StyledTitle>
            <ElementRef element={context.value} key={context.value.id} />
          </StyledTitle>
        </StyledFolder>
      </Components.Row>
    )
  }
})
