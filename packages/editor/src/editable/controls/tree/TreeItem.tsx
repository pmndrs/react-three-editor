import { useRef } from "react"
import { ReactNode } from "react"
import { Chevron } from "../folder/Chevron"
import {
  StyledContent,
  StyledFolder,
  StyledTitle,
  StyledWrapper
} from "../folder/StyledFolder"
import { useToggle } from "../folder/useToggle"

export function TreeItem({
  title,
  children,
  collapsed,
  setCollapsed,
  selected,
  visible,
  remeasure,
  collapsible,
  dirty
}: {
  title: ReactNode
  children: ReactNode
  collapsed: boolean
  setCollapsed: (flag: boolean) => void
  selected: boolean
  visible: boolean
  remeasure: boolean
  collapsible: boolean
  dirty: boolean
}) {
  if (!collapsible) {
    return (
      <StyledFolder dirty={dirty}>
        <StyledTitle selected={selected} visible={visible}>
          <Chevron hidden={true} toggled={!collapsed} />
          <div style={{ marginLeft: "2px" }} />
          {title}
        </StyledTitle>
      </StyledFolder>
    )
  } else {
    return (
      <CollapsibleTreeItem
        dirty={dirty}
        title={title}
        children={children}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        selected={selected}
        hideChevron={false}
        visible={visible}
        remeasure={remeasure}
      />
    )
  }
}

function CollapsibleTreeItem({
  title,
  dirty,
  children,
  collapsed,
  setCollapsed,
  selected,
  hideChevron,
  visible,
  remeasure
}: {
  title: ReactNode
  children: ReactNode
  collapsed: boolean
  setCollapsed: (flag: boolean) => void
  selected: boolean
  hideChevron: boolean
  visible: boolean
  remeasure: boolean
  dirty: boolean
}) {
  // const context = useInputContext<{ value: { element: EditableElement } }>()
  const { wrapperRef, contentRef } = useToggle(!collapsed)
  const ref = useRef<HTMLDivElement>(null)

  return (
    <StyledFolder ref={ref} dirty={dirty}>
      <StyledTitle selected={selected} visible={visible}>
        <Chevron
          hidden={hideChevron}
          toggled={!collapsed}
          onClick={() => {
            setCollapsed(!collapsed)
          }}
        />
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
