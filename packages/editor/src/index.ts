import react from "@vitejs/plugin-react"
import { default as babel } from "./babel"
import { default as vite } from "./server"

export function r3f() {
  return [
    process.env.NODE_ENV === "development" && vite(),
    react({
      babel: {
        plugins: [process.env.NODE_ENV === "development" && babel].filter(
          Boolean
        )
      }
    })
  ].filter(Boolean)
}
