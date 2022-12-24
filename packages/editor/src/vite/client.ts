import { createRPCClient } from "vite-dev-rpc"
import { RpcClientFunctions, RpcServerFunctions } from "./types"

export const client = createRPCClient<RpcServerFunctions, RpcClientFunctions>(
  "react-three-editor",
  import.meta.hot!,
  {}
)
