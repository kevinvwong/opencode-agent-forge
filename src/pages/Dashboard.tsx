import { useNavigate } from "react-router-dom"
import { useAgents } from "../db/hooks.ts"
import AgentCard from "../components/AgentCard.tsx"
import { deleteAgent, duplicateAgent } from "../db/hooks.ts"

export default function Dashboard() {
  const { agents, loading, refresh } = useAgents()
  const navigate = useNavigate()
  const templates = agents.filter((a) => a.isTemplate)
  const custom = agents.filter((a) => !a.isTemplate)

  const totalSessions = agents.reduce((s, a) => s + a.sessionCount, 0)
  const totalTokens = agents.reduce((s, a) => s + a.tokenCount, 0)
  const avgLevel = agents.length > 0 ? Math.round(agents.reduce((s, a) => s + a.dndLevel, 0) / agents.length) : 0

  const handleDelete = async (id: string) => {
    await deleteAgent(id)
    refresh()
  }

  const handleDuplicate = async (agent: typeof agents[0]) => {
    await duplicateAgent(agent)
    refresh()
  }

  const recent = [...agents].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  ).slice(0, 4)

  if (loading) {
    return <div style={{ color: "#8a8aae", textAlign: "center", paddingTop: "4rem" }}>Loading your adventuring party...</div>
  }

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "1.8rem", fontWeight: 700, color: "#e2dcc8", margin: 0 }}>
          Agent Forge Dashboard
        </h1>
        <p style={{ color: "#8a8aae", fontSize: "0.85rem", margin: "4px 0 0" }}>
          Manage your opencode agent roster
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: "2rem" }}>
        {[
          { label: "Total Agents", value: agents.length, color: "#d4a843" },
          { label: "Active Sessions", value: totalSessions, color: "#16a34a" },
          { label: "Tokens Consumed", value: totalTokens.toLocaleString(), color: "#2563eb" },
          { label: "Avg. Level", value: avgLevel, color: "#7c3aed" },
        ].map((stat) => (
          <div key={stat.label} className="sheet-panel" style={{ textAlign: "center", padding: "1rem" }}>
            <div style={{ fontSize: "0.7rem", color: "#8a8aae", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>
              {stat.label}
            </div>
            <div style={{ fontSize: "2rem", fontWeight: 700, color: stat.color, fontFamily: "var(--font-serif)" }}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {agents.length === 0 && (
        <div className="sheet-panel" style={{ textAlign: "center", padding: "3rem", marginBottom: "2rem" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🎲</div>
          <h2 style={{ fontFamily: "var(--font-serif)", color: "#e2dcc8", margin: "0 0 0.5rem" }}>
            Your roster is empty
          </h2>
          <p style={{ color: "#8a8aae", fontSize: "0.85rem", marginBottom: "1rem" }}>
            Create a new agent or import a template to get started.
          </p>
          <button className="btn-gold" onClick={() => navigate("/editor/new")}>
            Create Agent
          </button>
        </div>
      )}

      {templates.length > 0 && (
        <div style={{ marginBottom: "2rem" }}>
          <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "1.2rem", fontWeight: 600, color: "#d4a843", margin: "0 0 0.75rem" }}>
            Templates
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
            {templates.map((agent) => (
              <AgentCard key={agent.id} agent={agent} onDuplicate={handleDuplicate} />
            ))}
          </div>
        </div>
      )}

      {custom.length > 0 && (
        <div>
          <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "1.2rem", fontWeight: 600, color: "#e2dcc8", margin: "0 0 0.75rem" }}>
            Your Agents
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
            {custom.map((agent) => (
              <AgentCard key={agent.id} agent={agent} onDelete={handleDelete} onDuplicate={handleDuplicate} />
            ))}
          </div>
        </div>
      )}

      {recent.length > 0 && (
        <div style={{ marginTop: "2rem" }}>
          <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "1rem", fontWeight: 600, color: "#8a8aae", margin: "0 0 0.5rem" }}>
            Recently Updated
          </h2>
          <div style={{ display: "flex", gap: 8, fontSize: "0.8rem" }}>
            {recent.map((a) => (
              <span
                key={a.id}
                onClick={() => navigate(`/editor/${a.id}`)}
                style={{ color: "#d4a843", cursor: "pointer", borderBottom: "1px dotted #d4a843" }}
              >
                {a.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
