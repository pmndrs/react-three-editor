import { ComponentProps, FC, useMemo, useState } from "react"
import { LevaPanel } from "leva"
import { In, useThree } from "../fiber"
import { useEditor } from "../editable"

export const usePanel = (id: string) => {
  return useEditor().getPanel(id)
}

export type PanelProps = Omit<ComponentProps<typeof LevaPanel>, "store"> & {
  id: string
  title: string
  width?: number
  pos: "left" | "right"
}

export const Panel: FC<PanelProps> = ({
  id,
  pos,
  title,
  width = 280,
  ...props
}) => {
  const panel = usePanel(id)
  const editor = useEditor()
  const size = useThree(({ size }) => size)
  const [position, setPosition] = useState({
    x: pos === "left" ? -size.width + width! + 20 : 0,
    y: 0
  })

  return (
    <In>
      {panel ? (
        <LevaPanel
          store={panel}
          {...props}
          titleBar={{
            position,
            title,
            onDrag(position) {
              setPosition(position as any)
            }
          }}
        />
      ) : (
        <LevaPanel />
      )}
    </In>
  )
}
