import type { DnDStats } from "../types/agent.ts"
import { STAT_LABELS, STAT_FULL, STAT_COLORS, statModifier } from "../types/agent.ts"

interface Props {
  stats: DnDStats
  editable?: boolean
  onChange?: (stats: DnDStats) => void
}

export default function StatBlock({ stats, editable, onChange }: Props) {
  const keys = Object.keys(STAT_LABELS) as (keyof DnDStats)[]

  const handleStatChange = (stat: keyof DnDStats, value: number) => {
    if (!onChange) return
    const clamped = Math.max(3, Math.min(18, value))
    onChange({ ...stats, [stat]: clamped })
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 6,
      }}
    >
      {keys.map((key) => {
        const score = stats[key]
        const mod = statModifier(score)
        const modStr = mod >= 0 ? `+${mod}` : `${mod}`
        const color = STAT_COLORS[key]

        return (
          <div
            key={key}
            className="stat-card"
            style={{ borderTop: `3px solid ${color}` }}
          >
            <div style={{ fontSize: "0.65rem", color: color, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>
              {STAT_LABELS[key]}
            </div>
            {editable && onChange ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                <button
                  onClick={() => handleStatChange(key, score - 1)}
                  style={{ background: "none", border: "none", color: "#6a6a8e", cursor: "pointer", fontSize: "1rem", padding: "2px 4px" }}
                >
                  −
                </button>
                <span style={{ fontSize: "1.5rem", fontWeight: 700, color: "#e2dcc8", fontFamily: "var(--font-serif)" }}>
                  {score}
                </span>
                <button
                  onClick={() => handleStatChange(key, score + 1)}
                  style={{ background: "none", border: "none", color: "#6a6a8e", cursor: "pointer", fontSize: "1rem", padding: "2px 4px" }}
                >
                  +
                </button>
              </div>
            ) : (
              <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#e2dcc8", fontFamily: "var(--font-serif)" }}>
                {score}
              </div>
            )}
            <div style={{ fontSize: "0.75rem", color: "#8a8aae" }}>
              {modStr}
            </div>
            <div style={{ fontSize: "0.6rem", color: "#5a5a7e", marginTop: 2 }}>
              {STAT_FULL[key]}
            </div>
          </div>
        )
      })}
    </div>
  )
}
