import { createElement, FunctionComponent } from "react"
import { PanelGroup } from "react-resizable-panels"
import type { AutoSizerProps, Size } from "react-virtualized-auto-sizer"
import AutoSizer from "react-virtualized-auto-sizer"

function withAutoSizer<ComponentProps>(
  Component: FunctionComponent<ComponentProps>,
  autoSizerProps?: AutoSizerProps
): FunctionComponent<Omit<ComponentProps, "height" | "width">> {
  const AutoSizerWrapper = (
    props: Omit<ComponentProps, "height" | "width">
  ) => {
    return createElement(AutoSizer, {
      ...autoSizerProps,
      children: ({ height, width }: Size) =>
        createElement(Component as any, { ...props, height, width })
    })
  }

  return AutoSizerWrapper
}

export const ResizablePanelGroup = withAutoSizer(PanelGroup)
