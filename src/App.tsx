import { useEffect, useState } from "react"
import { Routes, Route } from "react-router-dom"
import Layout from "./components/Layout.tsx"
import { ToastProvider } from "./components/Toast.tsx"
import Dashboard from "./pages/Dashboard.tsx"
import Library from "./pages/Library.tsx"
import Editor from "./pages/Editor.tsx"
import { db } from "./db/schema.ts"
import { TEMPLATES } from "./data/templates.ts"

export default function App() {
  const [seeded, setSeeded] = useState(false)

  useEffect(() => {
    db.agents.count()
      .then((count) => {
        if (count === 0) {
          return db.agents.bulkAdd(TEMPLATES).then(() => setSeeded(true))
        }
        setSeeded(true)
      })
      .catch(() => setSeeded(true))
  }, [])

  if (!seeded) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#0c0a1a", color: "#8a8aae" }}>
        Forging your adventuring party...
      </div>
    )
  }

  return (
    <ToastProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/library" element={<Library />} />
          <Route path="/editor/:id" element={<Editor />} />
        </Routes>
      </Layout>
    </ToastProvider>
  )
}
