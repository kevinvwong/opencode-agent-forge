import { useNavigate } from "react-router-dom"
import { useState } from "react"
import type { Agent } from "../types/agent.ts"
import { CAPABILITY_COLORS, capModifier, CAPABILITY_LABELS, MODE_COLORS, MODE_LABELS, CAPABILITY_KEYS, computeMetrics, getHighestCapability, computeCapabilities } from "../types/agent.ts"
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
  const caps = computeCapabilities(agent)
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
        className="card"
        style={{
          display: "flex", alignItems: "center", gap: 12, padding: "0.55rem 0.75rem",
          borderLeft: `3px solid ${modeColor}`, cursor: "pointer",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = modeColor }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--color-border)" }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontWeight: 600, color: "var(--color-text)", fontSize: "0.875rem" }}>{agent.name || "Unnamed"}</span>
            <span className="mode-badge" style={{ color: modeColor, border: `1px solid ${modeColor}50` }}>{modeLabel}</span>
            {agent.isTemplate && <span style={{ fontSize: "0.55rem", color: "var(--color-text-muted)" }}>TEMPLATE</span>}
          </div>
          <div style={{ fontSize: "0.7rem", color: "var(--color-text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {agent.description}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0, fontSize: "0.7rem", color: "var(--color-text-muted)" }}>
          <span className="metric" style={{ color: "var(--color-danger)" }}>❤{metrics.sessionCapacity}</span>
          <span className="metric" title={`Allow: ${perms.allow} | Ask: ${perms.ask} | Deny: ${perms.deny}`}>
            <span style={{ color: "var(--color-success)" }}>●{perms.allow}</span>
            <span style={{ color: "var(--color-accent)", margin: "0 2px" }}>●{perms.ask}</span>
            <span style={{ color: "var(--color-text-muted)" }}>●{perms.deny}</span>
          </span>
        </div>
      </div>
    )
  }

  return (
    <div
      onClick={handleClick}
      className="card-elevated"
      style={{
        cursor: "pointer", overflow: "hidden",
        display: "flex", flexDirection: "column", position: "relative",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = modeColor; e.currentTarget.style.boxShadow = `0 0 24px ${modeColor}20` }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--color-border)"; e.currentTarget.style.boxShadow = "none" }}
    >
      <div style={{
        background: `linear-gradient(135deg, ${modeColor} 0%, ${modeColor}cc 100%)`,
        padding: "0.6rem 0.75rem", display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div>
          <div style={{ fontWeight: 700, color: "#fff", fontSize: "0.95rem", lineHeight: 1.2 }}>
            {agent.name || "Unnamed Agent"}
          </div>
          <div style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.7)" }}>
            {modeLabel} Agent
          </div>
        </div>
        <div style={{ position: "relative" }}>
          <button
            onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen) }}
            style={{ background: "rgba(0,0,0,0.25)", border: "none", color: "#fff", width: 28, height: 28, borderRadius: 5, cursor: "pointer", fontSize: "1rem", display: "flex", alignItems: "center", justifyContent: "center" }}
          >⋯</button>
          {menuOpen && (
            <div className="menu-panel" style={{ position: "absolute", right: 0, top: 34, zIndex: 10, minWidth: 140 }} onClick={(e) => e.stopPropagation()}>
              {[
                { label: "Edit", icon: "✎", fn: () => navigate(`/editor/${agent.id}`) },
                { label: "Export .md", icon: "⬇", fn: () => downloadAgentFile(agent) },
                ...(onDuplicate ? [{ label: "Duplicate", icon: "⧉", fn: () => onDuplicate(agent) }] : []),
                ...(onDelete ? [{ label: "Delete", icon: "✕", fn: () => onDelete(agent.id), danger: true }] : []),
              ].map((item) => (
                <div
                  key={item.label}
                  onClick={(e) => handleAction(e, item.fn)}
                  className={`menu-item${"danger" in item && item.danger ? " danger" : ""}`}
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
        <div style={{ fontSize: "0.72rem", color: "var(--color-text-secondary)", lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {agent.description}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {CAPABILITY_KEYS.map((k) => {
            const score = caps[k]
            const pct = Math.round((score / 18) * 100)
            const mod = capModifier(score)
            const isHighest = k === highest
            return (
              <div key={k} style={{ display: "flex", alignItems: "center", gap: 6 }}
                title={`${CAPABILITY_LABELS[k]}: ${score} (${mod >= 0 ? "+" : ""}${mod})`}>
                <span style={{ fontSize: "0.55rem", fontWeight: 700, color: CAPABILITY_COLORS[k], minWidth: 26, letterSpacing: 0.5 }}>
                  {CAPABILITY_LABELS[k]}
                </span>
                <div className="progress-track" style={{ flex: 1, height: 7 }}>
                  <div className="progress-fill" style={{
                    width: `${pct}%`,
                    boxShadow: isHighest ? "0 0 6px rgba(245,158,11,0.4)" : "none",
                  }} />
                </div>
                <span style={{ fontSize: "0.55rem", color: "var(--color-text-muted)", fontFamily: "var(--font-mono)", minWidth: 20, textAlign: "right" }}>
                  {mod >= 0 ? "+" : ""}{mod}
                </span>
              </div>
            )
          })}
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 4 }}>
          <div style={{ display: "flex", gap: 5, fontSize: "0.65rem" }}>
            <span className="metric" style={{ color: "var(--color-danger)" }}>❤{metrics.sessionCapacity}</span>
            <span className="metric" style={{ color: "#60a5fa" }}>🛡{metrics.securityRating}</span>
            <span className="metric" style={{ color: "var(--color-accent)" }}>⚡{metrics.responsiveness >= 0 ? "+" : ""}{metrics.responsiveness}</span>
            <span className="metric" style={{ color: "#a78bfa" }}>⤒+{metrics.proficiency}</span>
          </div>
          <div style={{ display: "flex", gap: 3, alignItems: "center" }}>
            <span className="proficiency-dot filled" style={{ width: 7, height: 7, display: perms.allow > 0 ? "inline-block" : "none" }} />
            <span style={{ fontSize: "0.6rem", color: perms.allow > 0 ? "var(--color-success)" : "var(--color-text-muted)" }}>{perms.allow}</span>
            <span className="proficiency-dot" style={{ width: 7, height: 7, background: "var(--color-accent)", borderColor: "var(--color-accent)", display: perms.ask > 0 ? "inline-block" : "none" }} />
            <span style={{ fontSize: "0.6rem", color: perms.ask > 0 ? "var(--color-accent)" : "var(--color-text-muted)" }}>{perms.ask}</span>
            <span style={{ fontSize: "0.6rem", color: "var(--color-text-muted)" }}>{perms.deny}</span>
          </div>
        </div>

        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", alignItems: "center" }}>
          {agent.tags.slice(0, 3).map((t) => (
            <span key={t} className="tag">#{t}</span>
          ))}
          {agent.tags.length > 3 && (
            <span style={{ fontSize: "0.5rem", color: "var(--color-text-muted)" }}>+{agent.tags.length - 3}</span>
          )}
          <div style={{ marginLeft: "auto" }}>
            <span style={{ fontSize: "0.5rem", color: "var(--color-text-muted)", fontFamily: "var(--font-mono)" }}>
              {agent.model.split("/").pop()}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
