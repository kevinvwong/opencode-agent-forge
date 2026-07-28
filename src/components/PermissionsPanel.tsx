import type { AgentPermissions, PermissionLevel } from "../types/agent.ts"
import { TOOL_LABELS, TOOL_DESCRIPTIONS } from "../types/agent.ts"

interface Props {
  permissions: AgentPermissions
  onChange?: (permissions: AgentPermissions) => void
  readonly?: boolean
}

const ALL_TOOLS = Object.keys(TOOL_LABELS) as (keyof typeof TOOL_LABELS)[]

const LEVEL_ORDER: PermissionLevel[] = ["allow", "ask", "deny"]

function nextLevel(current: PermissionLevel | undefined): PermissionLevel {
  const idx = LEVEL_ORDER.indexOf(current ?? "deny")
  return LEVEL_ORDER[(idx + 1) % LEVEL_ORDER.length]
}

export default function PermissionsPanel({ permissions, onChange, readonly }: Props) {
  const getLevel = (tool: string): PermissionLevel => {
    const v = permissions[tool]
    if (v === "allow" || v === "ask" || v === "deny") return v
    return "deny"
  }

  const cyclePermission = (tool: string) => {
    if (!onChange || readonly) return
    const current = getLevel(tool)
    const next = nextLevel(current)
    const updated = { ...permissions, [tool]: next }
    onChange(updated)
  }

  const levelColor = (level: PermissionLevel): string => {
    switch (level) {
      case "allow": return "#16a34a"
      case "ask": return "#d4a843"
      case "deny": return "#6a6a8e"
    }
  }

  const levelLabel = (level: PermissionLevel): string => {
    switch (level) {
      case "allow": return "Proficient"
      case "ask": return "Trained"
      case "deny": return "Untrained"
    }
  }

  return (
    <div>
      {ALL_TOOLS.map((tool) => {
        const level = getLevel(tool)
        const color = levelColor(level)

        return (
          <div
            key={tool}
            onClick={() => cyclePermission(tool)}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0.4rem 0.5rem",
              borderBottom: "1px solid #1a1a2e",
              cursor: readonly ? "default" : "pointer",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => { if (!readonly) e.currentTarget.style.background = "rgba(212,168,67,0.05)" }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent" }}
            title={TOOL_DESCRIPTIONS[tool]}
          >
            <div style={{ fontSize: "0.85rem", color: "#b8b0a0" }}>
              {TOOL_LABELS[tool]}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: "0.65rem", color: color, fontWeight: 500 }}>
                {levelLabel(level)}
              </span>
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  background: level === "allow" ? "#16a34a" : level === "ask" ? "#d4a843" : "transparent",
                  border: `2px solid ${color}`,
                  transition: "all 0.2s",
                }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
