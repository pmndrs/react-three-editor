import { createRPCClient } from "vite-dev-rpc"

export const client: {} = createRPCClient(
  "react-three-editor",
  import.meta.hot!,
  {}
)
