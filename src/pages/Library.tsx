import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAgents } from "../db/hooks.ts"
import { deleteAgent, duplicateAgent } from "../db/hooks.ts"
import { downloadAllAgents } from "../utils/export.ts"
import AgentCard from "../components/AgentCard.tsx"

type SortKey = "name" | "updatedAt" | "sessionCount" | "dndLevel"

export default function Library() {
  const { agents, loading, refresh } = useAgents()
  const navigate = useNavigate()
  const [search, setSearch] = useState("")
  const [sortBy, setSortBy] = useState<SortKey>("updatedAt")
  const [filterMode, setFilterMode] = useState<string>("all")

  const filtered = agents
    .filter((a) => {
      if (filterMode !== "all" && a.mode !== filterMode) return false
      if (!search) return true
      const q = search.toLowerCase()
      return (
        a.name.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.tags.some((t) => t.toLowerCase().includes(q))
      )
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name": return a.name.localeCompare(b.name)
        case "sessionCount": return b.sessionCount - a.sessionCount
        case "dndLevel": return b.dndLevel - a.dndLevel
        case "updatedAt": return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        default: return 0
      }
    })

  const handleDelete = async (id: string) => {
    await deleteAgent(id)
    refresh()
  }

  const handleDuplicate = async (agent: typeof agents[0]) => {
    await duplicateAgent(agent)
    refresh()
  }

  if (loading) {
    return <div style={{ color: "#8a8aae", textAlign: "center", paddingTop: "4rem" }}>Loading library...</div>
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "1.8rem", fontWeight: 700, color: "#e2dcc8", margin: 0 }}>
            Agent Library
          </h1>
          <p style={{ color: "#8a8aae", fontSize: "0.85rem", margin: "4px 0 0" }}>
            {filtered.length} of {agents.length} agents
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn-ghost" onClick={() => { downloadAllAgents(agents); void 0 }}>
            Export All
          </button>
          <button className="btn-gold" onClick={() => navigate("/editor/new")}>
            + New Agent
          </button>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: "1.25rem", flexWrap: "wrap" }}>
        <input
          className="input-field"
          placeholder="Search agents..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: 300 }}
        />
        <select
          className="input-field"
          value={filterMode}
          onChange={(e) => setFilterMode(e.target.value)}
          style={{ maxWidth: 140 }}
        >
          <option value="all">All Classes</option>
          <option value="primary">Fighter (Primary)</option>
          <option value="subagent">Wizard (Subagent)</option>
          <option value="all">Bard (All)</option>
        </select>
        <select
          className="input-field"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortKey)}
          style={{ maxWidth: 160 }}
        >
          <option value="updatedAt">Recently Updated</option>
          <option value="name">Name</option>
          <option value="dndLevel">Level</option>
          <option value="sessionCount">Most Used</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="sheet-panel" style={{ textAlign: "center", padding: "3rem" }}>
          <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🔍</div>
          <p style={{ color: "#8a8aae" }}>No agents match your search.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
          {filtered.map((agent) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              onDelete={handleDelete}
              onDuplicate={handleDuplicate}
            />
          ))}
        </div>
      )}
    </div>
  )
}
