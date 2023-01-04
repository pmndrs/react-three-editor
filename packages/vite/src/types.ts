import { EditPatch } from "@editable-jsx/state"

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
