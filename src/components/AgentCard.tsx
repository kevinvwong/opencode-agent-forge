import { useNavigate } from "react-router-dom"
import { useState } from "react"
import type { Agent } from "../types/agent.ts"
import { STAT_COLORS, statModifier, STAT_LABELS } from "../types/agent.ts"
import { getClassTheme, countPermissions, computeCombatStats, getHighestStat } from "../utils/classTheme.ts"
import { downloadAgentFile } from "../utils/export.ts"

interface Props {
  agent: Agent
  onDelete?: (id: string) => void
  onDuplicate?: (agent: Agent) => void
  view?: "grid" | "list"
}

export default function AgentCard({ agent, onDelete, onDuplicate, view = "grid" }: Props) {
  const navigate = useNavigate()
  const theme = getClassTheme(agent.mode)
  const stats = agent.dndStats
  const highest = getHighestStat(stats)
  const perms = countPermissions(agent.permissions)
  const combat = computeCombatStats(stats, agent.dndLevel)
  const [menuOpen, setMenuOpen] = useState(false)

  const handleClick = () => navigate(`/editor/${agent.id}`)

  const handleAction = (e: React.MouseEvent, fn: () => void) => {
    e.stopPropagation()
    fn()
    setMenuOpen(false)
  }

  if (view === "list") {
    return (
      <div
        onClick={handleClick}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "0.6rem 0.75rem",
          background: "linear-gradient(135deg, #1a1a2e 0%, #16162a 100%)",
          border: "1px solid #2a2a4e",
          borderLeft: `3px solid ${theme.color}`,
          borderRadius: 6,
          cursor: "pointer",
          transition: "all 0.15s",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = theme.color; e.currentTarget.style.boxShadow = `0 0 12px ${theme.borderGlow}` }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#2a2a4e"; e.currentTarget.style.boxShadow = "none" }}
      >
        <div style={{
          width: 32, height: 32, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center",
          background: theme.gradient, fontSize: "1rem", flexShrink: 0,
        }}>
          {theme.icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontWeight: 600, color: "#e2dcc8", fontSize: "0.9rem" }}>{agent.name || "Unnamed"}</span>
            <span style={{ fontSize: "0.6rem", color: theme.color, border: `1px solid ${theme.color}`, borderRadius: 3, padding: "0 4px" }}>{theme.label}</span>
            {agent.isTemplate && <span style={{ fontSize: "0.55rem", color: "#8a8aae" }}>TEMPLATE</span>}
          </div>
          <div style={{ fontSize: "0.7rem", color: "#8a8aae", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {agent.description}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0, fontSize: "0.7rem", color: "#6a6a8e" }}>
          <span>Lv.{agent.dndLevel}</span>
          <span>❤{combat.hp}</span>
          <span title={`Allow: ${perms.allow} | Ask: ${perms.ask} | Deny: ${perms.deny}`}>
            <span style={{ color: "#16a34a" }}>●{perms.allow}</span>
            <span style={{ color: "#d4a843", margin: "0 3px" }}>●{perms.ask}</span>
            <span style={{ color: "#6a6a8e" }}>●{perms.deny}</span>
          </span>
        </div>
      </div>
    )
  }

  const statsEntries = Object.keys(STAT_LABELS) as (keyof typeof STAT_LABELS)[]

  return (
    <div
      onClick={handleClick}
      style={{
        borderRadius: 8,
        overflow: "hidden",
        cursor: "pointer",
        transition: "all 0.2s",
        border: `1px solid #2a2a4e`,
        background: "linear-gradient(180deg, #1a1a2e 0%, #12121e 100%)",
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = theme.color; e.currentTarget.style.boxShadow = `0 0 20px ${theme.borderGlow}` }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#2a2a4e"; e.currentTarget.style.boxShadow = "none" }}
    >
      {/* Class-colored header bar */}
      <div style={{
        background: theme.gradient,
        padding: "0.6rem 0.75rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 6,
            background: "rgba(0,0,0,0.3)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "1.2rem",
          }}>
            {theme.icon}
          </div>
          <div>
            <div style={{ fontWeight: 700, color: "#fff", fontSize: "0.95rem", lineHeight: 1.2 }}>
              {agent.name || "Unnamed Agent"}
            </div>
            <div style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.7)", display: "flex", gap: 6 }}>
              <span>{theme.label} · Lv.{agent.dndLevel}</span>
              <span>{agent.dndRace}</span>
              <span>{agent.dndBackground}</span>
            </div>
          </div>
        </div>
        <div style={{ position: "relative" }}>
          <button
            onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen) }}
            style={{
              background: "rgba(0,0,0,0.3)", border: "none", color: "#fff",
              width: 28, height: 28, borderRadius: 4, cursor: "pointer",
              fontSize: "1rem", display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            ⋯
          </button>
          {menuOpen && (
            <div
              style={{
                position: "absolute", right: 0, top: 32, zIndex: 10,
                background: "#1a1a2e", border: "1px solid #3a3a5e", borderRadius: 6,
                minWidth: 140, boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {[
                { label: "Edit", icon: "✎", fn: () => navigate(`/editor/${agent.id}`) },
                { label: "Export .md", icon: "⬇", fn: () => downloadAgentFile(agent) },
                ...(onDuplicate ? [{ label: "Duplicate", icon: "⧉", fn: () => onDuplicate(agent) }] : []),
                ...(onDelete ? [{ label: "Delete", icon: "✕", fn: () => onDelete(agent.id), danger: true }] : []),
              ].map((item) => (
                <div
                  key={item.label}
                  onClick={(e) => handleAction(e, item.fn)}
                  style={{
                    padding: "0.4rem 0.75rem", cursor: "pointer", fontSize: "0.8rem",
                    color: "danger" in item && item.danger ? "#e74c3c" : "#c8c0b0",
                    display: "flex", alignItems: "center", gap: 8,
                    borderBottom: "1px solid #2a2a4e",
                    transition: "background 0.1s",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "rgba(212,168,67,0.08)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                >
                  <span style={{ fontSize: "0.7rem" }}>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ padding: "0.6rem 0.75rem", flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
        {/* Description */}
        <div style={{
          fontSize: "0.72rem", color: "#9a9290", lineHeight: 1.4,
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
        }}>
          {agent.description}
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 3 }}>
          {statsEntries.map((k) => {
            const score = stats[k]
            const mod = statModifier(score)
            const isHighest = k === highest
            const barPct = Math.round((score / 18) * 100)
            return (
              <div
                key={k}
                style={{
                  padding: "3px 4px",
                  borderRadius: 4,
                  background: isHighest ? `${STAT_COLORS[k]}15` : "rgba(255,255,255,0.03)",
                }}
                title={`${STAT_LABELS[k]}: ${score} (${mod >= 0 ? "+" : ""}${mod})`}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
                  <span style={{ fontSize: "0.55rem", color: STAT_COLORS[k], fontWeight: 700, letterSpacing: 0.5 }}>{STAT_LABELS[k]}</span>
                  <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#e2dcc8", fontFamily: "var(--font-serif)" }}>
                    {score}
                    <span style={{ fontSize: "0.55rem", color: "#8a8aae", fontWeight: 400, marginLeft: 2 }}>
                      ({mod >= 0 ? "+" : ""}{mod})
                    </span>
                  </span>
                </div>
                <div style={{ width: "100%", height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ width: `${barPct}%`, height: "100%", background: STAT_COLORS[k], borderRadius: 2, transition: "width 0.3s" }} />
                </div>
              </div>
            )
          })}
        </div>

        {/* Combat stats + Permission summary */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 4 }}>
          <div style={{ display: "flex", gap: 6, fontSize: "0.65rem" }}>
            <span style={{ color: "#ef4444" }}>❤{combat.hp}</span>
            <span style={{ color: "#60a5fa" }}>🛡{combat.ac}</span>
            <span style={{ color: "#fbbf24" }}>⚡{combat.initiative >= 0 ? "+" : ""}{combat.initiative}</span>
            <span style={{ color: "#a78bfa" }}>⤒+{combat.proficiency}</span>
          </div>
          <div style={{ display: "flex", gap: 3, alignItems: "center" }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#16a34a", display: perms.allow > 0 ? "inline-block" : "none" }} />
            <span style={{ fontSize: "0.6rem", color: perms.allow > 0 ? "#16a34a" : "#4a4a6e" }}>{perms.allow}</span>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#d4a843", display: perms.ask > 0 ? "inline-block" : "none" }} />
            <span style={{ fontSize: "0.6rem", color: perms.ask > 0 ? "#d4a843" : "#4a4a6e" }}>{perms.ask}</span>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#6a6a8e", display: perms.deny > 0 ? "inline-block" : "none" }} />
            <span style={{ fontSize: "0.6rem", color: perms.deny > 0 ? "#6a6a8e" : "#4a4a6e" }}>{perms.deny}</span>
          </div>
        </div>

        {/* Tags + Model */}
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", alignItems: "center" }}>
          {agent.tags.slice(0, 3).map((t) => (
            <span key={t} style={{
              fontSize: "0.55rem", background: "rgba(255,255,255,0.04)", color: "#7a7a9e",
              padding: "1px 5px", borderRadius: 3,
            }}>
              #{t}
            </span>
          ))}
          {agent.tags.length > 3 && (
            <span style={{ fontSize: "0.5rem", color: "#5a5a7e" }}>+{agent.tags.length - 3}</span>
          )}
          <div style={{ marginLeft: "auto" }}>
            <span style={{
              fontSize: "0.5rem", color: "#5a5a7e", fontFamily: "var(--font-mono)",
              background: "rgba(255,255,255,0.03)", padding: "1px 5px", borderRadius: 3,
            }}>
              {agent.model.split("/").pop()}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
