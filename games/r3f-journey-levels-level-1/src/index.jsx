// Original and the models by Bruno Simon: https://threejs-journey.com

import { createRoot } from "react-dom/client"
import { StrictMode, Suspense } from "react"
import { Loader } from "@react-three/drei"
import "./styles.css"
import App from "./App"

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Suspense fallback={null}>
      <App />
    </Suspense>
    <Loader />
  </StrictMode>
)
