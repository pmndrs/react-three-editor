import { createRPCClient } from "vite-dev-rpc"

export const client = createRPCClient<{
  save: (data: any) => Promise<void>
}>("vinxi", import.meta.hot!, {})
