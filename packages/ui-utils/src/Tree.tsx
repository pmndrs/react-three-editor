import { styled } from "leva/plugin"

import { ReactNode, useRef } from "react"
import { Chevron } from "./Chevron"
import ContextMenuDemo from "./ContextMenu"
import {
  StyledContent,
  StyledFolder,
  StyledTitle,
  StyledWrapper
} from "./StyledFolder"

export const Tree = styled("div", {
  // borderTop: "1px solid $elevation1",
  // borderBottom: "1px solid $elevation1",
  padding: "$sm 0px",
  variants: {
    scrollable: {
      true: {
        maxHeight: 180,
        overflow: "auto",
        "&::-webkit-scrollbar": {
          width: "8px",
          height: "100%",
          backgroundColor: "rgba(0,0,0,0.5)"
        },
        "&::-webkit-scrollbar-thumb": {
          backgroundColor: "$elevation3",
          borderRadius: "$lg"
        }
      },
      false: {}
    }
  }
})

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
  dirty?: boolean
}) {
  if (!collapsible) {
    return (
      <StyledFolder dirty={dirty}>
        <ContextMenuDemo>
          <StyledTitle selected={selected} visible={visible}>
            <Chevron hidden={true} toggled={!collapsed} />
            <div style={{ marginLeft: "2px" }} />
            {title}
          </StyledTitle>
        </ContextMenuDemo>
      </StyledFolder>
    )
  } else {
    return (
      <CollapsibleTreeItem
        dirty={dirty!}
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
  const ref = useRef<HTMLDivElement>(null)

  return (
    <StyledFolder ref={ref} dirty={dirty}>
      <ContextMenuDemo>
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
      </ContextMenuDemo>
      <StyledWrapper isRoot={false} fill={true} flat={true}>
        <StyledContent isRoot={false} toggled={!collapsed}>
          <div>{children}</div>
        </StyledContent>
      </StyledWrapper>
    </StyledFolder>
  )
}
