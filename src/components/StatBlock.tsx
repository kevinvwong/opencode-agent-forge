import type { AgentCapabilities } from "../types/agent.ts"
import { CAPABILITY_LABELS, CAPABILITY_FULL, CAPABILITY_COLORS, capModifier, CAPABILITY_KEYS } from "../types/agent.ts"
import { TOOLTIPS } from "../utils/tooltips.ts"

interface Props {
  capabilities: AgentCapabilities
}

export default function StatBlock({ capabilities }: Props) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      {CAPABILITY_KEYS.map((key) => {
        const score = capabilities[key]
        const pct = Math.round((score / 18) * 100)
        const mod = capModifier(score)
        const modStr = mod >= 0 ? `+${mod}` : `${mod}`

        return (
          <div key={key} className="card" style={{ padding: "5px 8px" }} title={TOOLTIPS.capabilities[key]}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ fontSize: "0.65rem", fontWeight: 700, color: CAPABILITY_COLORS[key], letterSpacing: 0.3, fontFamily: "var(--font-mono)" }}>
                  {CAPABILITY_LABELS[key]}
                </span>
                <span style={{ fontSize: "0.6rem", color: "var(--color-text-muted)" }}>
                  {CAPABILITY_FULL[key]}
                </span>
              </div>
              <span style={{ fontSize: "0.65rem", fontWeight: 600, color: "var(--color-text-secondary)", fontFamily: "var(--font-mono)" }} title={TOOLTIPS.stats.modifier}>
                {modStr}
              </span>
            </div>
            <div className="progress-track" style={{ height: 8 }} title={`${score}/18 — ${TOOLTIPS.stats.heatBar}`}>
              <div className="progress-fill" style={{ width: `${pct}%` }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}
