import type { AgentPermissions, PermissionLevel } from "../types/agent.ts"
import { TOOL_LABELS } from "../types/agent.ts"

export function getPermissionLevel(permissions: AgentPermissions, tool: string): PermissionLevel {
  const v = permissions[tool]
  if (v === "allow") return "allow"
  if (v === "ask") return "ask"
  if (v === "deny") return "deny"
  return "deny"
}

export function countPermissions(permissions: AgentPermissions): { allow: number; ask: number; deny: number } {
  const tools = Object.keys(TOOL_LABELS)
  const counts = { allow: 0, ask: 0, deny: 0 }
  for (const tool of tools) {
    const level = getPermissionLevel(permissions, tool)
    counts[level]++
  }
  return counts
}
