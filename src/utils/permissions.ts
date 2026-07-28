import type { AgentPermissions, PermissionLevel } from "../types/agent.ts"

export function getPermissionLevel(permissions: AgentPermissions, tool: string): PermissionLevel {
  const v = permissions[tool]
  if (v === "allow") return "allow"
  if (v === "ask") return "ask"
  if (v === "deny") return "deny"
  return "deny"
}

export function countPermissions(permissions: AgentPermissions): { allow: number; ask: number; deny: number } {
  const tools = ["read", "write", "edit", "apply_patch", "glob", "grep", "list", "bash", "task", "external_directory", "todowrite", "webfetch", "websearch", "lsp", "skill", "question"]
  const counts = { allow: 0, ask: 0, deny: 0 }
  for (const tool of tools) {
    const level = getPermissionLevel(permissions, tool)
    counts[level]++
  }
  return counts
}
