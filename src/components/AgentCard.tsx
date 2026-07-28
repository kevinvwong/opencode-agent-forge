import { useNavigate } from "react-router-dom"
import type { Agent } from "../types/agent.ts"
import { MODE_CLASS_MAP, STAT_COLORS, statModifier } from "../types/agent.ts"

interface Props {
  agent: Agent
  onDelete?: (id: string) => void
  onDuplicate?: (agent: Agent) => void
}

export default function AgentCard({ agent, onDelete, onDuplicate }: Props) {
  const navigate = useNavigate()
  const className = MODE_CLASS_MAP[agent.mode]
  const stats = agent.dndStats
  const highest = (Object.keys(stats) as (keyof typeof stats)[]).reduce((a, b) =>
    stats[a] >= stats[b] ? a : b
  )

  return (
    <div
      className="sheet-panel"
      style={{
        cursor: "pointer",
        transition: "all 0.2s",
        display: "flex",
        flexDirection: "column",
      }}
      onClick={() => navigate(`/editor/${agent.id}`)}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "#d4a843"
        e.currentTarget.style.boxShadow = "0 0 16px rgba(212,168,67,0.15)"
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "#2a2a4e"
        e.currentTarget.style.boxShadow = "none"
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
        <div>
          <div style={{ fontFamily: "var(--font-serif)", fontSize: "1.1rem", fontWeight: 600, color: "#e2dcc8" }}>
            {agent.name}
          </div>
          <div style={{ fontSize: "0.75rem", color: "#8a8aae" }}>
            {className} · Level {agent.dndLevel} · {agent.dndRace}
          </div>
        </div>
        {agent.isTemplate && (
          <span style={{ fontSize: "0.6rem", color: "#d4a843", border: "1px solid #d4a843", borderRadius: 4, padding: "1px 6px", textTransform: "uppercase" }}>
            Template
          </span>
        )}
      </div>

      <div
        style={{ fontSize: "0.75rem", color: "#8a8aae", marginBottom: 10, flex: 1, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}
      >
        {agent.description}
      </div>

      <div style={{ display: "flex", gap: 4, marginBottom: 10 }}>
        {(Object.keys(stats) as (keyof typeof stats)[]).map((k) => (
          <div
            key={k}
            style={{
              flex: 1,
              textAlign: "center",
              padding: "2px 0",
              borderRadius: 4,
              background: k === highest ? `${STAT_COLORS[k]}20` : "transparent",
            }}
            title={`${k}: ${stats[k]} (${statModifier(stats[k]) >= 0 ? "+" : ""}${statModifier(stats[k])})`}
          >
            <div style={{ fontSize: "0.55rem", color: STAT_COLORS[k], fontWeight: 600 }}>{k.slice(0, 3).toUpperCase()}</div>
            <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "#e2dcc8", fontFamily: "var(--font-serif)" }}>{stats[k]}</div>
          </div>
        ))}
      </div>

      {agent.tags.length > 0 && (
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 8 }}>
          {agent.tags.map((t) => (
            <span
              key={t}
              style={{
                fontSize: "0.6rem",
                background: "rgba(212,168,67,0.1)",
                color: "#d4a843",
                padding: "1px 6px",
                borderRadius: 4,
              }}
            >
              {t}
            </span>
          ))}
        </div>
      )}

      {agent.lastUsed && (
        <div style={{ fontSize: "0.6rem", color: "#5a5a7e" }}>
          Last used: {new Date(agent.lastUsed).toLocaleDateString()}
        </div>
      )}

      {(onDelete || onDuplicate) && (
        <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
          {onDuplicate && (
            <button
              className="btn-ghost"
              style={{ fontSize: "0.75rem", padding: "2px 8px" }}
              onClick={(e) => { e.stopPropagation(); onDuplicate(agent) }}
            >
              Duplicate
            </button>
          )}
          {onDelete && (
            <button
              className="btn-ghost"
              style={{ fontSize: "0.75rem", padding: "2px 8px", borderColor: "#6a2a2a", color: "#e74c3c" }}
              onClick={(e) => { e.stopPropagation(); onDelete(agent.id) }}
            >
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  )
}
