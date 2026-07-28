import { Routes, Route } from "react-router-dom"
import Layout from "./components/Layout.tsx"
import Dashboard from "./pages/Dashboard.tsx"
import Library from "./pages/Library.tsx"
import Editor from "./pages/Editor.tsx"

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/library" element={<Library />} />
        <Route path="/editor/:id" element={<Editor />} />
      </Routes>
    </Layout>
  )
}
