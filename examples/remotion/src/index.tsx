import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { RemotionRoot } from "./Root"
import "./styles.css"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RemotionRoot />
  </StrictMode>,
)
