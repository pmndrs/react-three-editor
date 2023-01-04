import { EditPatch } from "../types"

export type RpcServerFunctions = {
  save(patches: EditPatch | EditPatch[]): Promise<void>
  initializeComponentsWatcher(): Promise<
    { fileName: string; components: string[] }[]
  >
}

export type RpcClientFunctions = {}

export type ServerOptions = {
  componentsDir?: string
}
