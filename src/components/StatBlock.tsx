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
            style={{
              padding: "5px 8px",
              borderRadius: 6,
              background: isHighest ? `${CAPABILITY_COLORS[key]}10` : "rgba(255,255,255,0.02)",
              border: isHighest ? `1px solid ${CAPABILITY_COLORS[key]}30` : "1px solid transparent",
            }}
            title={`${CAPABILITY_FULL[key]}: ${score}/18`}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: "0.7rem", fontWeight: 700, color: CAPABILITY_COLORS[key], letterSpacing: 0.5, minWidth: 32 }}>
                  {CAPABILITY_LABELS[key]}
                </span>
                <span style={{ fontSize: "0.6rem", color: "#6a6a8e" }}>
                  {CAPABILITY_FULL[key]}
                </span>
              </div>
              <span style={{ fontSize: "0.7rem", fontWeight: 600, color: "#8a8aae", fontFamily: "var(--font-mono)" }}>
                {modStr}
              </span>
            </div>
            <div style={{ position: "relative", height: 10, background: "rgba(255,255,255,0.05)", borderRadius: 5, overflow: "hidden" }}>
              <div
                style={{
                  width: `${pct}%`,
                  height: "100%",
                  borderRadius: 5,
                  background: "linear-gradient(90deg, #dc2626 0%, #ea580c 33%, #d4a843 66%, #16a34a 100%)",
                  transition: "width 0.4s ease",
                  boxShadow: isHighest ? "0 0 8px rgba(212,168,67,0.5)" : "none",
                }}
              />
              <div
                style={{
                  position: "absolute", right: 4, top: 0, height: "100%",
                  display: "flex", alignItems: "center",
                  fontSize: "0.5rem", fontWeight: 700, color: "rgba(255,255,255,0.7)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {score}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
