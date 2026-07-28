import type { AgentPermissions, PermissionLevel } from "../types/agent.ts"
import { TOOL_LABELS } from "../types/agent.ts"

interface Props {
  permissions: AgentPermissions
  size?: "sm" | "md"
}

export default function SkillProficiencies({ permissions, size = "md" }: Props) {
  const dotSize = size === "sm" ? 10 : 14
  const fontS = size === "sm" ? "0.6rem" : "0.75rem"

  const getLevel = (tool: string): PermissionLevel => {
    const v = permissions[tool]
    if (v === "allow" || v === "ask" || v === "deny") return v
    return "deny"
  }

  const dots = (level: PermissionLevel): number => {
    switch (level) {
      case "allow": return 3
      case "ask": return 2
      case "deny": return 1
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {Object.entries(TOOL_LABELS).map(([key, label]) => {
        const level = getLevel(key)
        const count = dots(level)

        return (
          <div
            key={key}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "1px 4px",
            }}
          >
            <span style={{ fontSize: fontS, color: "#a8a0a0" }}>{label}</span>
            <div style={{ display: "flex", gap: 3 }}>
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`proficiency-dot ${i <= count ? "filled" : ""}`}
                  style={{ width: dotSize, height: dotSize }}
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
