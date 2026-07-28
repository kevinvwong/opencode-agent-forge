import { useNavigate } from "react-router-dom"
import { useAgents, deleteAgent, duplicateAgent } from "../db/hooks.ts"
import { useToast } from "../components/Toast.tsx"
import AgentCard from "../components/AgentCard.tsx"
import { MODE_COLORS, computeMetrics, CAPABILITY_KEYS, CAPABILITY_LABELS, CAPABILITY_COLORS, computeCapabilities } from "../types/agent.ts"

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
    return <div style={{ color: "#8a8aae", textAlign: "center", paddingTop: "6rem", fontSize: "1.1rem" }}>Loading agent roster...</div>
  }

  const hasData = agents.length > 0

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "1.8rem", fontWeight: 700, color: "#e2dcc8", margin: 0 }}>
            Agent Forge
          </h1>
          <p style={{ color: "#8a8aae", fontSize: "0.8rem", margin: "4px 0 0" }}>
            Manage your opencode agent roster
            {hasData && (
              <span style={{ marginLeft: 8 }}>
                · {agents.length} agents · ❤{totalCapacity} total session capacity
              </span>
            )}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn-ghost" onClick={() => navigate("/library")} style={{ fontSize: "0.8rem" }}>Library</button>
          <button className="btn-gold" onClick={() => navigate("/editor/new")} style={{ fontSize: "0.8rem" }}>+ New Agent</button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10, marginBottom: "1.5rem" }}>
        {[
          { label: "Total Agents", value: agents.length, icon: "👥", color: "#d4a843" },
          { label: "Total Sessions", value: totalSessions, icon: "⚡", color: "#7c3aed" },
          { label: "Session Capacity", value: totalCapacity, icon: "❤", color: "#ef4444" },
          { label: "Templates", value: templates.length, icon: "📋", color: "#60a5fa" },
        ].map((stat) => (
          <div key={stat.label} className="stat-card" style={{ border: "1px solid #2a2a4e", padding: "1rem" }}>
            <div style={{ fontSize: "1.2rem", marginBottom: 4 }}>{stat.icon}</div>
            <div style={{ fontSize: "1.6rem", fontWeight: 700, color: stat.color, fontFamily: "var(--font-serif)" }}>{stat.value}</div>
            <div style={{ fontSize: "0.65rem", color: "#8a8aae", textTransform: "uppercase", letterSpacing: 1 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {!hasData && (
        <div style={{ textAlign: "center", padding: "4rem 1rem", marginBottom: "1.5rem" }}>
          <div style={{ fontSize: "4rem", marginBottom: "0.75rem", opacity: 0.6 }}>📋</div>
          <h2 style={{ fontFamily: "var(--font-serif)", color: "#e2dcc8", margin: "0 0 0.5rem", fontSize: "1.3rem" }}>
            No agents yet
          </h2>
          <p style={{ color: "#8a8aae", fontSize: "0.85rem", marginBottom: "1.25rem", maxWidth: 400, margin: "0 auto 1.25rem" }}>
            Create your first agent or load the templates to get started.
          </p>
          <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
            <button className="btn-gold" onClick={() => navigate("/editor/new")}>+ Create Agent</button>
          </div>
        </div>
      )}

      {hasData && avgCaps && (
        <div className="sheet-panel" style={{ marginBottom: "1.5rem" }}>
          <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "0.85rem", color: "#8a8aae", margin: "0 0 8px", textTransform: "uppercase", letterSpacing: 1 }}>
            Roster Average Capabilities
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {CAPABILITY_KEYS.map((key) => {
              const val = avgCaps[key]
              const pct = Math.round((val / 18) * 100)
              return (
                <div key={key} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: "0.6rem", fontWeight: 700, color: CAPABILITY_COLORS[key], minWidth: 30, letterSpacing: 0.5 }}>
                    {CAPABILITY_LABELS[key]}
                  </span>
                  <div style={{ flex: 1, height: 10, background: "rgba(255,255,255,0.04)", borderRadius: 5, overflow: "hidden" }}>
                    <div style={{
                      width: `${pct}%`, height: "100%", borderRadius: 5,
                      background: "linear-gradient(90deg, #dc2626 0%, #ea580c 33%, #d4a843 66%, #16a34a 100%)",
                      transition: "width 0.4s",
                    }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {templates.length > 0 && (
        <div style={{ marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.6rem" }}>
            <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "1.1rem", fontWeight: 600, color: "#d4a843", margin: 0 }}>
              Templates
            </h2>
            <span style={{ fontSize: "0.7rem", color: "#5a5a7e" }}>Duplicate to create your own agent</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 10 }}>
            {templates.map((agent) => (
              <AgentCard key={agent.id} agent={agent} onDuplicate={handleDuplicate} />
            ))}
          </div>
        </div>
      )}

      {custom.length > 0 && (
        <div style={{ marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.6rem" }}>
            <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "1.1rem", fontWeight: 600, color: "#e2dcc8", margin: 0 }}>
              Your Agents
            </h2>
            <span style={{ fontSize: "0.7rem", color: "#5a5a7e" }}>{custom.length} agent{custom.length !== 1 ? "s" : ""}</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 10 }}>
            {custom.map((agent) => (
              <AgentCard key={agent.id} agent={agent} onDelete={handleDelete} onDuplicate={handleDuplicate} />
            ))}
          </div>
        </div>
      )}

      {hasData && (
        <div className="sheet-panel">
          <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "0.85rem", color: "#8a8aae", margin: "0 0 8px", textTransform: "uppercase", letterSpacing: 1 }}>
            Recently Updated
          </h3>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {recent.map((a) => {
              const color = MODE_COLORS[a.mode]
              return (
                <span
                  key={a.id}
                  onClick={() => navigate(`/editor/${a.id}`)}
                  style={{
                    padding: "0.25rem 0.6rem", borderRadius: 4, border: `1px solid ${color}30`,
                    background: `${color}08`, color: "#e2dcc8", cursor: "pointer", fontSize: "0.75rem",
                    display: "flex", alignItems: "center", gap: 4,
                  }}
                >
                  <span>{a.name}</span>
                  <span style={{ fontSize: "0.6rem", color: "#6a6a8e", marginLeft: 4 }}>
                    {new Date(a.updatedAt).toLocaleDateString()}
                  </span>
                </span>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
