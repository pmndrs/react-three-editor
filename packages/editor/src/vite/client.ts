import { createRPCClient } from "vite-dev-rpc"

export const client: {
  save: (data: any) => Promise<void>
} = createRPCClient("react-three-editor", import.meta.hot!, {})
