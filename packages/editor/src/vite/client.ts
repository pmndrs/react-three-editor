import { createRPCClient } from "vite-dev-rpc"
import { EditPatch } from "../types"

export const client: {
  save: (data: EditPatch[]) => Promise<void>
} = createRPCClient("react-three-editor", import.meta.hot!, {})
