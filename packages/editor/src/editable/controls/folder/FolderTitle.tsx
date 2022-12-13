import React from "react"
import { StyledTitle } from "./StyledFolder"
import { Chevron } from "./Chevron"

export type FolderTitleProps = {
  name?: string
  toggled: boolean
  toggle: (flag?: boolean) => void
}

export function FolderTitle({ toggle, toggled, name }: FolderTitleProps) {
  return (
    <StyledTitle onClick={() => toggle()}>
      <Chevron toggled={toggled} />
      <div>{name}</div>
    </StyledTitle>
  )
}
