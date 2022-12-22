import { ReactNode, useRef } from "react"
import { Chevron } from "../folder/Chevron"
import {
  StyledContent,
  StyledFolder,
  StyledTitle,
  StyledWrapper
} from "../folder/StyledFolder"

export function TreeItem({
  title,
  children,
  collapsed,
  setCollapsed,
  selected,
  visible,
  collapsible,
  dirty
}: {
  title: ReactNode
  children: ReactNode
  collapsed: boolean
  setCollapsed: (flag: boolean) => void
  selected: boolean
  visible: boolean
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
  visible
}: {
  title: ReactNode
  children: ReactNode
  collapsed: boolean
  setCollapsed: (flag: boolean) => void
  selected: boolean
  hideChevron: boolean
  visible: boolean
  dirty: boolean
}) {
  console.log(title, collapsed)
  // const context = useInputContext<{ value: { element: EditableElement } }>()
  // const { wrapperRef, contentRef } = useToggle(!collapsed)
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
      <StyledWrapper isRoot={false} fill={true} flat={true}>
        <StyledContent isRoot={false} toggled={!collapsed}>
          <div>{children}</div>
        </StyledContent>
      </StyledWrapper>
    </StyledFolder>
  )
}
