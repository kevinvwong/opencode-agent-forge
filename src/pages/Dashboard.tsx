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
    return <div style={{ color: "var(--color-text-muted)", textAlign: "center", paddingTop: "6rem", fontFamily: "var(--font-mono)", fontSize: "0.8rem" }}>Initializing dashboard...</div>
  }

  const hasData = agents.length > 0

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
        <div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "var(--color-accent)", textTransform: "uppercase", letterSpacing: 2, marginBottom: 2 }}>
            Command Center
          </div>
          <h1 style={{ fontFamily: "var(--font-mono)", fontSize: "1.5rem", fontWeight: 700, color: "var(--color-text)", margin: 0, letterSpacing: 1 }}>
            DASHBOARD
          </h1>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.7rem", fontFamily: "var(--font-mono)", margin: "4px 0 0" }}>
            {agents.length} agent{agents.length !== 1 ? "s" : ""} in roster
            {hasData && <span> · ❤{totalCapacity} total capacity</span>}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn-ghost" onClick={() => navigate("/library")}>Library</button>
          <button className="btn-primary" onClick={() => navigate("/editor/new")}>+ New</button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 8, marginBottom: "1.5rem" }}>
        {[
          { label: "Agents", value: agents.length, color: "var(--color-accent)" },
          { label: "Sessions", value: totalSessions, color: "var(--color-info)" },
          { label: "Capacity", value: totalCapacity, color: "var(--color-danger)" },
          { label: "Templates", value: templates.length, color: "var(--color-warning)" },
        ].map((stat) => (
          <div key={stat.label} className="card" style={{ padding: "0.75rem 1rem" }}>
            <div className="value-label">{stat.label}</div>
            <div className="metric-value" style={{ color: stat.color }}>{stat.value}</div>
          </div>
        ))}
      </div>

      {!hasData && (
        <div className="card" style={{ textAlign: "center", padding: "3rem 1rem", marginBottom: "1.5rem" }}>
          <div style={{ fontSize: "2rem", marginBottom: "0.5rem", opacity: 0.4 }}>⚙</div>
          <h2 style={{ fontFamily: "var(--font-mono)", color: "var(--color-text-muted)", margin: "0 0 0.5rem", fontSize: "0.9rem", letterSpacing: 1 }}>
            NO AGENTS DEPLOYED
          </h2>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.75rem", fontFamily: "var(--font-mono)", marginBottom: "1rem" }}>
            Create an agent or load templates to populate the roster.
          </p>
          <button className="btn-primary" onClick={() => navigate("/editor/new")}>+ Create Agent</button>
        </div>
      )}

      {hasData && avgCaps && (
        <div className="card" style={{ padding: "0.75rem 1rem", marginBottom: "1.5rem" }}>
          <div className="section-header">Roster Capabilities</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {CAPABILITY_KEYS.map((key) => {
              const val = avgCaps[key]
              const pct = Math.round((val / 18) * 100)
              return (
                <div key={key} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: "0.55rem", fontWeight: 700, color: CAPABILITY_COLORS[key], minWidth: 28, fontFamily: "var(--font-mono)", letterSpacing: 0.5 }}>
                    {CAPABILITY_LABELS[key]}
                  </span>
                  <div className="progress-track" style={{ flex: 1, height: 8 }}>
                    <div className="progress-fill" style={{ width: `${pct}%` }} />
                  </div>
                  <span style={{ fontSize: "0.6rem", color: "var(--color-text-muted)", fontFamily: "var(--font-mono)", minWidth: 18, textAlign: "right" }}>
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
          <div className="section-header">Templates</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 8 }}>
            {templates.map((agent) => (
              <AgentCard key={agent.id} agent={agent} onDuplicate={handleDuplicate} />
            ))}
          </div>
        </div>
      )}

      {custom.length > 0 && (
        <div style={{ marginBottom: "1.5rem" }}>
          <div className="section-header">Active Agents</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 8 }}>
            {custom.map((agent) => (
              <AgentCard key={agent.id} agent={agent} onDelete={handleDelete} onDuplicate={handleDuplicate} />
            ))}
          </div>
        </div>
      )}

      {hasData && (
        <div className="card" style={{ padding: "0.75rem 1rem" }}>
          <div className="section-header">Recent Activity</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {recent.map((a) => (
              <span
                key={a.id}
                onClick={() => navigate(`/editor/${a.id}`)}
                className="tag"
                style={{ cursor: "pointer", border: "1px solid var(--color-border)", padding: "3px 8px" }}
              >
                <span className={`status-dot ${a.disabled ? "off" : "on"}`} style={{ marginRight: 4 }} />
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
