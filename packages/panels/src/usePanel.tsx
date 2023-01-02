import { usePanelManager } from "./usePanelManager"

export function usePanel(defaultName: string) {
  const manager = usePanelManager()
  return manager.get(defaultName)
}
