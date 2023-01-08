import { IdContext, setEditable } from "@editable-jsx/editable"
import { ThreeCanvas } from "@remotion/three"
import { useId } from "react"

setEditable(ThreeCanvas, ({ children, ...props }) => {
  const id = useId()
  return (
    <ThreeCanvas {...props}>
      <IdContext.Provider value={id}>{children}</IdContext.Provider>
    </ThreeCanvas>
  )
})
