import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import App from "./App.tsx"
import ErrorBoundary from "./components/ErrorBoundary.tsx"
import "./index.css"

const rootEl = document.getElementById("app")
if (!rootEl) throw new Error("Root element #app not found")

createRoot(rootEl).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter basename="/opencode-agent-forge">
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>
)
