import { Leva } from "leva"
import { PropsWithChildren } from "react"
import { PanelManager } from "./PanelManager"
import { PanelManagerContext } from "./usePanelManager"

export function PanelsProvider({
  manager,
  children
}: PropsWithChildren<{ manager: PanelManager }>) {
  return (
    <PanelManagerContext.Provider value={manager}>
      <Leva isRoot hidden />
      {children}
    </PanelManagerContext.Provider>
  )
}
