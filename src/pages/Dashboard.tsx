import { useNavigate } from "react-router-dom"
import { useAgents, deleteAgent, duplicateAgent } from "../db/hooks.ts"
import { useToast } from "../components/Toast.tsx"
import AgentCard from "../components/AgentCard.tsx"
import { computeMetrics, CAPABILITY_KEYS, CAPABILITY_LABELS, CAPABILITY_COLORS, computeCapabilities } from "../types/agent.ts"

export default function Dashboard() {
  const { agents, loading, refresh } = useAgents()
  const navigate = useNavigate()
  const { toast } = useToast()

  const templates = agents.filter((a) => a.isTemplate)
  const custom = agents.filter((a) => !a.isTemplate)
  const allCaps = agents.map((a) => computeCapabilities(a))

  const avgCaps = allCaps.length > 0 ? {
    toolAccess: Math.round(allCaps.reduce((s, a) => s + a.toolAccess, 0) / allCaps.length),
    responseAgility: Math.round(allCaps.reduce((s, a) => s + a.responseAgility, 0) / allCaps.length),
    sessionResilience: Math.round(allCaps.reduce((s, a) => s + a.sessionResilience, 0) / allCaps.length),
    modelIntelligence: Math.round(allCaps.reduce((s, a) => s + a.modelIntelligence, 0) / allCaps.length),
    contextAwareness: Math.round(allCaps.reduce((s, a) => s + a.contextAwareness, 0) / allCaps.length),
    collaboration: Math.round(allCaps.reduce((s, a) => s + a.collaboration, 0) / allCaps.length),
  } : null

  const totalSessions = agents.reduce((s, a) => s + a.sessionCount, 0)
  const totalCapacity = agents.reduce((s, a) => s + computeMetrics(computeCapabilities(a)).sessionCapacity, 0)

  const handleDelete = async (id: string) => {
    try {
      await deleteAgent(id)
      toast("Agent deleted", "error")
      refresh()
    } catch (err) {
      toast(`Failed to delete: ${err}`, "error")
    }
  }

  const handleDuplicate = async (agent: typeof agents[0]) => {
    try {
      const dup = await duplicateAgent(agent)
      toast(`Duplicated as "${dup.name}"`, "success")
      refresh()
    } catch (err) {
      toast(`Failed to duplicate: ${err}`, "error")
    }
  }

  const recent = [...agents].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  ).slice(0, 4)

  if (loading) {
    return <div style={{ color: "var(--color-text-muted)", textAlign: "center", paddingTop: "6rem" }}>Loading...</div>
  }

  const hasData = agents.length > 0

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ fontSize: "1.35rem", fontWeight: 600, color: "var(--color-text)", margin: 0 }}>
            Dashboard
          </h1>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.8125rem", margin: "4px 0 0" }}>
            {agents.length} agent{agents.length !== 1 ? "s" : ""}
            {hasData && <span> · {totalCapacity} total session capacity</span>}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn-ghost" onClick={() => navigate("/library")}>Library</button>
          <button className="btn-primary" onClick={() => navigate("/editor/new")}>+ New Agent</button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 8, marginBottom: "1.5rem" }}>
        {[
          { label: "Agents", value: agents.length, color: "var(--color-accent)" },
          { label: "Sessions", value: totalSessions, color: "var(--color-info)" },
          { label: "Capacity", value: totalCapacity, color: "var(--color-danger)" },
          { label: "Templates", value: templates.length, color: "var(--color-warning)" },
        ].map((stat) => (
          <div key={stat.label} className="card" style={{ padding: "0.75rem 1rem" }}>
            <div style={{ fontSize: "0.6875rem", color: "var(--color-text-muted)", marginBottom: 2 }}>{stat.label}</div>
            <div style={{ fontSize: "1.5rem", fontWeight: 700, color: stat.color, fontFamily: "var(--font-mono)", lineHeight: 1.2 }}>{stat.value}</div>
          </div>
        ))}
      </div>

      {!hasData && (
        <div className="card" style={{ textAlign: "center", padding: "3rem 1rem", marginBottom: "1.5rem" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem", opacity: 0.3 }}>⚙</div>
          <h2 style={{ color: "var(--color-text-secondary)", margin: "0 0 0.5rem", fontSize: "1rem", fontWeight: 600 }}>
            No agents yet
          </h2>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.8125rem", marginBottom: "1rem" }}>
            Create your first agent or load the templates to get started.
          </p>
          <button className="btn-primary" onClick={() => navigate("/editor/new")}>+ Create Agent</button>
        </div>
      )}

      {hasData && avgCaps && (
        <div className="card" style={{ padding: "0.75rem 1rem", marginBottom: "1.5rem" }}>
          <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--color-text-secondary)", marginBottom: "0.5rem" }}>
            Average Capabilities
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {CAPABILITY_KEYS.map((key) => {
              const val = avgCaps[key]
              const pct = Math.round((val / 18) * 100)
              const barClass = val >= 14 ? "good" : val >= 9 ? "" : "bad"
              return (
                <div key={key} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: "0.6rem", fontWeight: 600, color: CAPABILITY_COLORS[key], minWidth: 28 }}>
                    {CAPABILITY_LABELS[key]}
                  </span>
                  <div className="progress-track" style={{ flex: 1, height: 6 }}>
                    <div className={`progress-fill ${barClass}`} style={{ width: `${pct}%` }} />
                  </div>
                  <span style={{ fontSize: "0.65rem", color: "var(--color-text-muted)", fontFamily: "var(--font-mono)", minWidth: 18, textAlign: "right" }}>
                    {val}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {templates.length > 0 && (
        <div style={{ marginBottom: "1.5rem" }}>
          <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--color-text-secondary)", marginBottom: "0.5rem" }}>
            Templates
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 8 }}>
            {templates.map((agent) => (
              <AgentCard key={agent.id} agent={agent} onDuplicate={handleDuplicate} />
            ))}
          </div>
        </div>
      )}

      {custom.length > 0 && (
        <div style={{ marginBottom: "1.5rem" }}>
          <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--color-text-secondary)", marginBottom: "0.5rem" }}>
            Custom Agents
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 8 }}>
            {custom.map((agent) => (
              <AgentCard key={agent.id} agent={agent} onDelete={handleDelete} onDuplicate={handleDuplicate} />
            ))}
          </div>
        </div>
      )}

      {hasData && (
        <div className="card" style={{ padding: "0.75rem 1rem" }}>
          <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--color-text-secondary)", marginBottom: "0.5rem" }}>
            Recently Updated
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {recent.map((a) => (
              <span
                key={a.id}
                onClick={() => navigate(`/editor/${a.id}`)}
                className="tag"
                style={{ cursor: "pointer", padding: "3px 8px" }}
              >
                {a.name}
                <span style={{ marginLeft: 6, color: "var(--color-text-muted)" }}>
                  {new Date(a.updatedAt).toLocaleDateString()}
                </span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
