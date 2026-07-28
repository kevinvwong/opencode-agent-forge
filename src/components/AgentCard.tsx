import { useNavigate } from "react-router-dom"
import { useState } from "react"
import type { Agent } from "../types/agent.ts"
import { CAPABILITY_COLORS, capModifier, CAPABILITY_LABELS, MODE_COLORS, MODE_LABELS, CAPABILITY_KEYS, computeMetrics, getHighestCapability } from "../types/agent.ts"
import { countPermissions } from "../utils/permissions.ts"
import { downloadAgentFile } from "../utils/export.ts"

interface Props {
  agent: Agent
  onDelete?: (id: string) => void
  onDuplicate?: (agent: Agent) => void
  view?: "grid" | "list"
}

export default function AgentCard({ agent, onDelete, onDuplicate, view = "grid" }: Props) {
  const navigate = useNavigate()
  const caps = agent.capabilities
  const highest = getHighestCapability(caps)
  const perms = countPermissions(agent.permissions)
  const metrics = computeMetrics(caps)
  const [menuOpen, setMenuOpen] = useState(false)
  const modeColor = MODE_COLORS[agent.mode]
  const modeLabel = MODE_LABELS[agent.mode]

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
          display: "flex", alignItems: "center", gap: 12, padding: "0.6rem 0.75rem",
          background: "linear-gradient(135deg, #1a1a2e 0%, #16162a 100%)",
          border: "1px solid #2a2a4e", borderLeft: `3px solid ${modeColor}`, borderRadius: 6,
          cursor: "pointer", transition: "all 0.15s",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = modeColor; e.currentTarget.style.boxShadow = `0 0 12px ${modeColor}30` }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#2a2a4e"; e.currentTarget.style.boxShadow = "none" }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontWeight: 600, color: "#e2dcc8", fontSize: "0.9rem" }}>{agent.name || "Unnamed"}</span>
            <span style={{ fontSize: "0.6rem", color: modeColor, border: `1px solid ${modeColor}`, borderRadius: 3, padding: "0 4px" }}>{modeLabel}</span>
            {agent.isTemplate && <span style={{ fontSize: "0.55rem", color: "#8a8aae" }}>TEMPLATE</span>}
          </div>
          <div style={{ fontSize: "0.7rem", color: "#8a8aae", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {agent.description}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0, fontSize: "0.7rem", color: "#6a6a8e" }}>
          <span title={`Session capacity: ${metrics.sessionCapacity}`}>❤{metrics.sessionCapacity}</span>
          <span title={`Allow: ${perms.allow} | Ask: ${perms.ask} | Deny: ${perms.deny}`}>
            <span style={{ color: "#16a34a" }}>●{perms.allow}</span>
            <span style={{ color: "#d4a843", margin: "0 3px" }}>●{perms.ask}</span>
            <span style={{ color: "#6a6a8e" }}>●{perms.deny}</span>
          </span>
        </div>
      </div>
    )
  }

  return (
    <div
      onClick={handleClick}
      style={{
        borderRadius: 8, overflow: "hidden", cursor: "pointer", transition: "all 0.2s",
        border: `1px solid #2a2a4e`, background: "linear-gradient(180deg, #1a1a2e 0%, #12121e 100%)",
        display: "flex", flexDirection: "column", position: "relative",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = modeColor; e.currentTarget.style.boxShadow = `0 0 20px ${modeColor}30` }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#2a2a4e"; e.currentTarget.style.boxShadow = "none" }}
    >
      <div style={{ background: `linear-gradient(135deg, ${modeColor} 0%, ${modeColor}aa 100%)`, padding: "0.6rem 0.75rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontWeight: 700, color: "#fff", fontSize: "0.95rem", lineHeight: 1.2 }}>
            {agent.name || "Unnamed Agent"}
          </div>
          <div style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.7)", display: "flex", gap: 6 }}>
            <span>{modeLabel} Agent</span>
          </div>
        </div>
        <div style={{ position: "relative" }}>
          <button
            onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen) }}
            style={{ background: "rgba(0,0,0,0.3)", border: "none", color: "#fff", width: 28, height: 28, borderRadius: 4, cursor: "pointer", fontSize: "1rem", display: "flex", alignItems: "center", justifyContent: "center" }}
          >⋯</button>
          {menuOpen && (
            <div
              style={{ position: "absolute", right: 0, top: 32, zIndex: 10, background: "#1a1a2e", border: "1px solid #3a3a5e", borderRadius: 6, minWidth: 140, boxShadow: "0 4px 20px rgba(0,0,0,0.4)" }}
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
                    borderBottom: "1px solid #2a2a4e", transition: "background 0.1s",
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
        <div style={{ fontSize: "0.72rem", color: "#9a9290", lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {agent.description}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 3 }}>
          {CAPABILITY_KEYS.map((k) => {
            const score = caps[k]
            const mod = capModifier(score)
            const isHighest = k === highest
            const barPct = Math.round((score / 18) * 100)
            return (
              <div key={k} style={{ padding: "3px 4px", borderRadius: 4, background: isHighest ? `${CAPABILITY_COLORS[k]}15` : "rgba(255,255,255,0.03)" }}
                title={`${CAPABILITY_LABELS[k]}: ${score} (${mod >= 0 ? "+" : ""}${mod})`}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
                  <span style={{ fontSize: "0.55rem", color: CAPABILITY_COLORS[k], fontWeight: 700, letterSpacing: 0.5 }}>{CAPABILITY_LABELS[k]}</span>
                  <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#e2dcc8", fontFamily: "var(--font-serif)" }}>
                    {score}
                    <span style={{ fontSize: "0.55rem", color: "#8a8aae", fontWeight: 400, marginLeft: 2 }}>
                      ({mod >= 0 ? "+" : ""}{mod})
                    </span>
                  </span>
                </div>
                <div style={{ width: "100%", height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ width: `${barPct}%`, height: "100%", background: CAPABILITY_COLORS[k], borderRadius: 2, transition: "width 0.3s" }} />
                </div>
              </div>
            )
          })}
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 4 }}>
          <div style={{ display: "flex", gap: 6, fontSize: "0.65rem" }}>
            <span style={{ color: "#ef4444" }}>❤{metrics.sessionCapacity}</span>
            <span style={{ color: "#60a5fa" }}>🛡{metrics.securityRating}</span>
            <span style={{ color: "#fbbf24" }}>⚡{metrics.responsiveness >= 0 ? "+" : ""}{metrics.responsiveness}</span>
            <span style={{ color: "#a78bfa" }}>⤒+{metrics.proficiency}</span>
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

        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", alignItems: "center" }}>
          {agent.tags.slice(0, 3).map((t) => (
            <span key={t} style={{ fontSize: "0.55rem", background: "rgba(255,255,255,0.04)", color: "#7a7a9e", padding: "1px 5px", borderRadius: 3 }}>
              #{t}
            </span>
          ))}
          {agent.tags.length > 3 && (
            <span style={{ fontSize: "0.5rem", color: "#5a5a7e" }}>+{agent.tags.length - 3}</span>
          )}
          <div style={{ marginLeft: "auto" }}>
            <span style={{ fontSize: "0.5rem", color: "#5a5a7e", fontFamily: "var(--font-mono)", background: "rgba(255,255,255,0.03)", padding: "1px 5px", borderRadius: 3 }}>
              {agent.model.split("/").pop()}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
