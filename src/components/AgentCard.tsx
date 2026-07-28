import { useNavigate } from "react-router-dom"
import { useState } from "react"
import type { Agent } from "../types/agent.ts"
import { CAPABILITY_COLORS, capModifier, CAPABILITY_LABELS, MODE_COLORS, CAPABILITY_KEYS, computeMetrics, getHighestCapability, computeCapabilities } from "../types/agent.ts"
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
  const modeLabel = agent.mode === "primary" ? "PRIMARY" : agent.mode === "subagent" ? "SUB" : "ALL"

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
        className="data-row"
        style={{ cursor: "pointer", borderLeft: `3px solid ${modeColor}`, gap: 12 }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = modeColor }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--color-border)" }}
      >
        <span className={`status-dot ${agent.disabled ? "off" : "on"}`} style={{ flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontWeight: 600, color: "var(--color-text)", fontSize: "0.8125rem", fontFamily: "var(--font-mono)" }}>
              {agent.name || "unnamed"}
            </span>
            <span className="mode-badge" style={{ color: modeColor, border: `1px solid ${modeColor}50` }}>{modeLabel}</span>
            {agent.isTemplate && <span className="tag">TEMPLATE</span>}
          </div>
          <div style={{ fontSize: "0.7rem", color: "var(--color-text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {agent.description}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0, fontSize: "0.65rem", fontFamily: "var(--font-mono)", color: "var(--color-text-muted)" }}>
          <span>❤{metrics.sessionCapacity}</span>
          <span style={{ color: "var(--color-accent)" }}>●{perms.allow}</span>
          <span style={{ color: "var(--color-warning)" }}>●{perms.ask}</span>
          <span>●{perms.deny}</span>
        </div>
      </div>
    )
  }

  return (
    <div
      onClick={handleClick}
      className="card-elevated"
      style={{ cursor: "pointer", overflow: "hidden", display: "flex", flexDirection: "column" }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = modeColor; e.currentTarget.style.boxShadow = `0 0 24px ${modeColor}15` }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--color-border)"; e.currentTarget.style.boxShadow = "none" }}
    >
      <div style={{
        background: `linear-gradient(135deg, ${modeColor} 0%, ${modeColor}cc 100%)`,
        padding: "0.5rem 0.75rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span className={`status-dot ${agent.disabled ? "off" : "on"}`} />
          <div>
            <div style={{ fontWeight: 700, color: "#fff", fontSize: "0.85rem", fontFamily: "var(--font-mono)", lineHeight: 1.2 }}>
              {agent.name || "unnamed"}
            </div>
            <div style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.65)", fontFamily: "var(--font-mono)" }}>
              {modeLabel} · {agent.model.split("/").pop()}
            </div>
          </div>
        </div>
        <div style={{ position: "relative" }}>
          <button
            onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen) }}
            style={{ background: "rgba(0,0,0,0.25)", border: "none", color: "#fff", width: 26, height: 26, borderRadius: 3, cursor: "pointer", fontSize: "0.9rem", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-mono)" }}
          >⋯</button>
          {menuOpen && (
            <div className="menu-panel" style={{ position: "absolute", right: 0, top: 30, zIndex: 10, minWidth: 140 }} onClick={(e) => e.stopPropagation()}>
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
                  <span style={{ fontSize: "0.65rem" }}>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ padding: "0.6rem 0.75rem", flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ fontSize: "0.7rem", color: "var(--color-text-secondary)", lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", fontFamily: "var(--font-sans)" }}>
          {agent.description}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {CAPABILITY_KEYS.map((k) => {
            const score = caps[k]
            const pct = Math.round((score / 18) * 100)
            const mod = capModifier(score)
            const isHighest = k === highest
            return (
              <div key={k} style={{ display: "flex", alignItems: "center", gap: 5 }}
                title={`${CAPABILITY_LABELS[k]}: ${score} (${mod >= 0 ? "+" : ""}${mod})`}>
                <span style={{ fontSize: "0.5rem", fontWeight: 700, color: CAPABILITY_COLORS[k], minWidth: 24, letterSpacing: 0.5, fontFamily: "var(--font-mono)" }}>
                  {CAPABILITY_LABELS[k]}
                </span>
                <div className="progress-track" style={{ flex: 1, height: 6 }}>
                  <div className="progress-fill" style={{ width: `${pct}%`, boxShadow: isHighest ? "0 0 6px rgba(0,204,102,0.3)" : "none" }} />
                </div>
                <span style={{ fontSize: "0.5rem", color: "var(--color-text-muted)", fontFamily: "var(--font-mono)", minWidth: 20, textAlign: "right" }}>
                  {mod >= 0 ? "+" : ""}{mod}
                </span>
              </div>
            )
          })}
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 4, paddingTop: 4, borderTop: "1px solid var(--color-border)" }}>
          <div style={{ display: "flex", gap: 8, fontFamily: "var(--font-mono)", fontSize: "0.6rem" }}>
            <span style={{ color: "var(--color-danger)" }}>❤{metrics.sessionCapacity}</span>
            <span style={{ color: "var(--color-info)" }}>🛡{metrics.securityRating}</span>
            <span style={{ color: "var(--color-warning)" }}>⚡{metrics.responsiveness >= 0 ? "+" : ""}{metrics.responsiveness}</span>
            <span style={{ color: "var(--color-text-muted)" }}>PB+{metrics.proficiency}</span>
          </div>
          <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
            {agent.tags.slice(0, 2).map((t) => (
              <span key={t} className="tag">{t}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
