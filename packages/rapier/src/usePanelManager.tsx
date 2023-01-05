import { createContext, useContext } from "react"
import { PanelManager } from "./PanelManager"

export const PanelManagerContext = createContext<PanelManager>(null as any)

export function usePanelManager() {
  return useContext(PanelManagerContext)
}
