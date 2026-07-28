import type { AgentCapabilities } from "../types/agent.ts"
import { CAPABILITY_LABELS, CAPABILITY_FULL, CAPABILITY_COLORS, capModifier, CAPABILITY_KEYS } from "../types/agent.ts"

interface Props {
  capabilities: AgentCapabilities
  editable?: boolean
  onChange?: (caps: AgentCapabilities) => void
}

export default function StatBlock({ capabilities, editable, onChange }: Props) {
  const handleChange = (key: keyof AgentCapabilities, value: number) => {
    if (!onChange) return
    const clamped = Math.max(3, Math.min(18, value))
    onChange({ ...capabilities, [key]: clamped })
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
      {CAPABILITY_KEYS.map((key) => {
        const score = capabilities[key]
        const mod = capModifier(score)
        const modStr = mod >= 0 ? `+${mod}` : `${mod}`
        const color = CAPABILITY_COLORS[key]

        return (
          <div
            key={key}
            className="stat-card"
            style={{ borderTop: `3px solid ${color}` }}
          >
            <div style={{ fontSize: "0.65rem", color, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>
              {CAPABILITY_LABELS[key]}
            </div>
            {editable && onChange ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                <button
                  onClick={() => handleChange(key, score - 1)}
                  style={{ background: "none", border: "none", color: "#6a6a8e", cursor: "pointer", fontSize: "1rem", padding: "2px 4px" }}
                >−</button>
                <span style={{ fontSize: "1.5rem", fontWeight: 700, color: "#e2dcc8", fontFamily: "var(--font-serif)" }}>
                  {score}
                </span>
                <button
                  onClick={() => handleChange(key, score + 1)}
                  style={{ background: "none", border: "none", color: "#6a6a8e", cursor: "pointer", fontSize: "1rem", padding: "2px 4px" }}
                >+</button>
              </div>
            ) : (
              <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#e2dcc8", fontFamily: "var(--font-serif)" }}>
                {score}
              </div>
            )}
            <div style={{ fontSize: "0.75rem", color: "#8a8aae" }}>{modStr}</div>
            <div style={{ fontSize: "0.6rem", color: "#5a5a7e", marginTop: 2 }}>
              {CAPABILITY_FULL[key]}
            </div>
          </div>
        )
      })}
    </div>
  )
}
