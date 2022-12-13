import React from "react"
import { useToggle } from "../folder/useToggle"
import {
  StyledContent,
  StyledFolder,
  StyledTitle,
  StyledWrapper
} from "../folder/StyledFolder"
import { Chevron } from "../folder/Chevron"

export function TreeItem({
  title,
  children,
  collapsed,
  setCollapsed,
  selected,
  visible,
  remeasure,
  collapsible
}: {
  title: React.ReactNode
  children: React.ReactNode
  collapsed: boolean
  setCollapsed: (flag: boolean) => void
  selected: boolean
  visible: boolean
  remeasure: boolean
  collapsible: boolean
}) {
  if (!collapsible) {
    return (
      <StyledFolder>
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
  children,
  collapsed,
  setCollapsed,
  selected,
  hideChevron,
  visible,
  remeasure
}: {
  title: React.ReactNode
  children: React.ReactNode
  collapsed: boolean
  setCollapsed: (flag: boolean) => void
  selected: boolean
  hideChevron: boolean
  visible: boolean
  remeasure: boolean
}) {
  // const context = useInputContext<{ value: { element: EditableElement } }>()
  const { wrapperRef, contentRef } = useToggle(!collapsed)
  const ref = React.useRef<HTMLDivElement>(null)

  // React.useEffect(() => {
  //   if (remeasure) {
  //     let el = ref.current?.parentElement?.parentElement?.parentElement
  //     let el2 = ref.current?.parentElement?.parentElement
  //     console.log(el, el2, wrapperRef.current, ref.current?.parentElement)
  //     if (!el) {
  //       return
  //     }
  //     const { height } = ref.current?.parentElement!.getBoundingClientRect()
  //     console.log(height)
  //     if (height > 0) el.style.height = height + 20 + "px"
  //   }
  // }, [context.value.element, remeasure])

  return (
    <StyledFolder ref={ref}>
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
