import { useNavigate } from "react-router-dom"
import { useAgents, deleteAgent, duplicateAgent } from "../db/hooks.ts"
import { useToast } from "../components/Toast.tsx"
import AgentCard from "../components/AgentCard.tsx"
import { getClassTheme, computeCombatStats } from "../utils/classTheme.ts"
import { MODE_CLASS_MAP } from "../types/agent.ts"

export default function Dashboard() {
  const { agents, loading, refresh } = useAgents()
  const navigate = useNavigate()
  const { toast } = useToast()

  const templates = agents.filter((a) => a.isTemplate)
  const custom = agents.filter((a) => !a.isTemplate)
  const allStats = agents.map((a) => a.dndStats)
  const avgStats = allStats.length > 0 ? {
    str: Math.round(allStats.reduce((s, a) => s + a.strength, 0) / allStats.length),
    dex: Math.round(allStats.reduce((s, a) => s + a.dexterity, 0) / allStats.length),
    con: Math.round(allStats.reduce((s, a) => s + a.constitution, 0) / allStats.length),
    int: Math.round(allStats.reduce((s, a) => s + a.intelligence, 0) / allStats.length),
    wis: Math.round(allStats.reduce((s, a) => s + a.wisdom, 0) / allStats.length),
    cha: Math.round(allStats.reduce((s, a) => s + a.charisma, 0) / allStats.length),
  } : null

  const totalSessions = agents.reduce((s, a) => s + a.sessionCount, 0)
  const avgLevel = agents.length > 0 ? Math.round(agents.reduce((s, a) => s + a.dndLevel, 0) / agents.length) : 0
  const totalHp = agents.reduce((s, a) => s + computeCombatStats(a.dndStats, a.dndLevel).hp, 0)

  const classCounts = { Fighter: 0, Wizard: 0, Bard: 0 }
  for (const a of agents) {
    const cls = MODE_CLASS_MAP[a.mode]
    if (cls in classCounts) classCounts[cls as keyof typeof classCounts]++
  }

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
    return <div style={{ color: "#8a8aae", textAlign: "center", paddingTop: "6rem", fontSize: "1.1rem" }}>Loading your adventuring party...</div>
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
                · {agents.length} agents · Party Lv.{avgLevel} · ❤{totalHp} total HP
              </span>
            )}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn-ghost" onClick={() => navigate("/library")} style={{ fontSize: "0.8rem" }}>
            Library
          </button>
          <button className="btn-gold" onClick={() => navigate("/editor/new")} style={{ fontSize: "0.8rem" }}>
            + New Agent
          </button>
        </div>
      </div>

      {/* Campaign stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10, marginBottom: "1.5rem" }}>
        {[
          { label: "Party Size", value: agents.length, icon: "👥", color: "#d4a843" },
          { label: "Avg Level", value: avgLevel, icon: "⤒", color: "#7c3aed" },
          { label: "Total HP", value: totalHp, icon: "❤", color: "#ef4444" },
          { label: "Sessions", value: totalSessions, icon: "⚔", color: "#60a5fa" },
        ].map((stat) => (
          <div key={stat.label} className="stat-card" style={{ border: "1px solid #2a2a4e", padding: "1rem" }}>
            <div style={{ fontSize: "1.2rem", marginBottom: 4 }}>{stat.icon}</div>
            <div style={{ fontSize: "1.6rem", fontWeight: 700, color: stat.color, fontFamily: "var(--font-serif)" }}>
              {stat.value}
            </div>
            <div style={{ fontSize: "0.65rem", color: "#8a8aae", textTransform: "uppercase", letterSpacing: 1 }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Class distribution */}
      {hasData && (
        <div style={{ display: "flex", gap: 12, marginBottom: "1.5rem", flexWrap: "wrap" }}>
          {(["Fighter", "Wizard", "Bard"] as const).map((cls) => {
            const theme = cls === "Fighter" ? getClassTheme("primary") : cls === "Wizard" ? getClassTheme("subagent") : getClassTheme("all")
            const count = classCounts[cls]
            if (count === 0) return null
            return (
              <div key={cls} style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "0.4rem 0.75rem", borderRadius: 6,
                border: `1px solid ${theme.color}30`,
                background: `${theme.color}08`,
              }}>
                <span style={{ fontSize: "1.1rem" }}>{theme.icon}</span>
                <div>
                  <div style={{ fontSize: "0.8rem", fontWeight: 600, color: theme.color }}>{cls}</div>
                  <div style={{ fontSize: "0.65rem", color: "#8a8aae" }}>{count} agent{count !== 1 ? "s" : ""}</div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Empty state */}
      {!hasData && (
        <div style={{ textAlign: "center", padding: "4rem 1rem", marginBottom: "1.5rem" }}>
          <div style={{ fontSize: "4rem", marginBottom: "0.75rem", opacity: 0.6 }}>🎲</div>
          <h2 style={{ fontFamily: "var(--font-serif)", color: "#e2dcc8", margin: "0 0 0.5rem", fontSize: "1.3rem" }}>
            Your party is empty
          </h2>
          <p style={{ color: "#8a8aae", fontSize: "0.85rem", marginBottom: "1.25rem", maxWidth: 400, margin: "0 auto 1.25rem" }}>
            Forge your first agent, or load the template adventurers to get started.
          </p>
          <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
            <button className="btn-gold" onClick={() => navigate("/editor/new")}>
              + Create Agent
            </button>
          </div>
        </div>
      )}

      {/* Avg stats */}
      {hasData && avgStats && (
        <div className="sheet-panel" style={{ marginBottom: "1.5rem" }}>
          <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "0.85rem", color: "#8a8aae", margin: "0 0 8px", textTransform: "uppercase", letterSpacing: 1 }}>
            Party Average Abilities
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 6 }}>
            {[
              { key: "str", label: "STR", val: avgStats.str, color: "#dc2626" },
              { key: "dex", label: "DEX", val: avgStats.dex, color: "#ea580c" },
              { key: "con", label: "CON", val: avgStats.con, color: "#16a34a" },
              { key: "int", label: "INT", val: avgStats.int, color: "#2563eb" },
              { key: "wis", label: "WIS", val: avgStats.wis, color: "#7c3aed" },
              { key: "cha", label: "CHA", val: avgStats.cha, color: "#db2777" },
            ].map((s) => (
              <div key={s.key} style={{ textAlign: "center" }}>
                <div style={{ fontSize: "0.6rem", color: s.color, fontWeight: 600 }}>{s.label}</div>
                <div style={{ fontSize: "1.3rem", fontWeight: 700, color: "#e2dcc8", fontFamily: "var(--font-serif)" }}>{s.val}</div>
                <div style={{ width: "100%", height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ width: `${(s.val / 18) * 100}%`, height: "100%", background: s.color, borderRadius: 2 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Templates section */}
      {templates.length > 0 && (
        <div style={{ marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.6rem" }}>
            <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "1.1rem", fontWeight: 600, color: "#d4a843", margin: 0 }}>
              ⚜ Templates
            </h2>
            <span style={{ fontSize: "0.7rem", color: "#5a5a7e" }}>
              Click to customize · Duplicate to create your own
            </span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 10 }}>
            {templates.map((agent) => (
              <AgentCard key={agent.id} agent={agent} onDuplicate={handleDuplicate} />
            ))}
          </div>
        </div>
      )}

      {/* Custom agents */}
      {custom.length > 0 && (
        <div style={{ marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.6rem" }}>
            <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "1.1rem", fontWeight: 600, color: "#e2dcc8", margin: 0 }}>
              Your Agents
            </h2>
            <span style={{ fontSize: "0.7rem", color: "#5a5a7e" }}>
              {custom.length} agent{custom.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 10 }}>
            {custom.map((agent) => (
              <AgentCard key={agent.id} agent={agent} onDelete={handleDelete} onDuplicate={handleDuplicate} />
            ))}
          </div>
        </div>
      )}

      {/* Recent activity */}
      {hasData && (
        <div className="sheet-panel">
          <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "0.85rem", color: "#8a8aae", margin: "0 0 8px", textTransform: "uppercase", letterSpacing: 1 }}>
            Recently Updated
          </h3>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {recent.map((a) => {
              const theme = getClassTheme(a.mode)
              return (
                <span
                  key={a.id}
                  onClick={() => navigate(`/editor/${a.id}`)}
                  style={{
                    padding: "0.25rem 0.6rem",
                    borderRadius: 4,
                    border: `1px solid ${theme.color}30`,
                    background: `${theme.color}08`,
                    color: theme.colorSecondary,
                    cursor: "pointer",
                    fontSize: "0.75rem",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <span>{theme.icon}</span>
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
