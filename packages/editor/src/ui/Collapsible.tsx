import { ReactNode, useRef } from "react"
import { Chevron } from "./folder/Chevron"
import {
  StyledContent,
  StyledFolder,
  StyledTitle,
  StyledWrapper
} from "./folder/StyledFolder"
import { useToggle } from "./folder/useToggle"

export function Collapsible({
  title,
  children,
  collapsed,
  setCollapsed
}: {
  title: ReactNode
  children: ReactNode
  collapsed: boolean
  setCollapsed: (flag: boolean) => void
}) {
  // const context = useInputContext<{ value: { element: EditableElement } }>()
  const { wrapperRef, contentRef } = useToggle(!collapsed)
  const ref = useRef<HTMLDivElement>(null)

  return (
    <StyledFolder ref={ref} dirty={false}>
      <StyledTitle
        onClick={() => {
          setCollapsed(!collapsed)
        }}
        selected={false}
        visible={true}
      >
        <Chevron toggled={!collapsed} />
        <div style={{ marginLeft: "2px" }} />
        {title}
      </StyledTitle>
      <StyledWrapper ref={wrapperRef} isRoot={false} fill={true} flat={true}>
        <StyledContent ref={contentRef} isRoot={false} toggled={!collapsed}>
          <div>{children}</div>
        </StyledContent>
      </StyledWrapper>
    </StyledFolder>
  )
}
