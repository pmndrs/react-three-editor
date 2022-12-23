import { createRPCClient } from "vite-dev-rpc"

export const client: {
  save: (data: any) => Promise<void>
} = createRPCClient("vinxi", import.meta.hot!, {})
