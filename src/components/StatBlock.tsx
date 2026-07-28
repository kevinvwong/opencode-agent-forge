import type { AgentCapabilities } from "../types/agent.ts"
import { CAPABILITY_LABELS, CAPABILITY_FULL, CAPABILITY_COLORS, capModifier, CAPABILITY_KEYS, getHighestCapability } from "../types/agent.ts"

interface Props {
  capabilities: AgentCapabilities
}

export default function StatBlock({ capabilities }: Props) {
  const highest = getHighestCapability(capabilities)

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {CAPABILITY_KEYS.map((key) => {
        const score = capabilities[key]
        const pct = Math.round((score / 18) * 100)
        const mod = capModifier(score)
        const modStr = mod >= 0 ? `+${mod}` : `${mod}`
        const isHighest = key === highest

        return (
          <div
            key={key}
            className="card"
            style={{
              padding: "6px 10px",
              borderColor: isHighest ? `${CAPABILITY_COLORS[key]}40` : undefined,
            }}
            title={`${CAPABILITY_FULL[key]}: ${score}/18`}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: "0.7rem", fontWeight: 700, color: CAPABILITY_COLORS[key], letterSpacing: 0.5, minWidth: 32 }}>
                  {CAPABILITY_LABELS[key]}
                </span>
                <span style={{ fontSize: "0.6rem", color: "var(--color-text-muted)" }}>
                  {CAPABILITY_FULL[key]}
                </span>
              </div>
              <span style={{ fontSize: "0.7rem", fontWeight: 600, color: "var(--color-text-secondary)", fontFamily: "var(--font-mono)" }}>
                {modStr}
              </span>
            </div>
            <div className="progress-track" style={{ height: 10 }}>
              <div className="progress-fill" style={{
                width: `${pct}%`,
                boxShadow: isHighest ? "0 0 8px rgba(245,158,11,0.4)" : "none",
              }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}
