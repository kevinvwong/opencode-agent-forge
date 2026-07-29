import type { Agent, PermissionLevel, BashPermission } from "../types/agent.ts"

function formatPermission(value: PermissionLevel | BashPermission | undefined): string {
  if (!value) return "deny"
  if (typeof value === "string") return value
  const lines = Object.entries(value).filter(([, v]) => v != null).map(([k, v]) => `    "${k}": "${v}"`)
  return `\n${lines.join("\n")}`
}

export function agentToMarkdown(agent: Agent): string {
  const permLines: string[] = []
  const permKeys = Object.keys(agent.permissions) as (keyof typeof agent.permissions)[]
  for (const key of permKeys) {
    const val = agent.permissions[key]
    if (!val) continue
    const formatted = formatPermission(val)
    if (formatted.startsWith("\n")) {
      permLines.push(`${key}:${formatted}`)
    } else {
      permLines.push(`${key}: ${formatted}`)
    }
  }

  const frontmatter = [
    "---",
    `description: ${agent.description}`,
    `mode: ${agent.mode}`,
    agent.model ? `model: ${agent.model}` : null,
    agent.temperature != null ? `temperature: ${agent.temperature}` : null,
    agent.topP != null ? `top_p: ${agent.topP}` : null,
    agent.steps != null ? `steps: ${agent.steps}` : null,
    agent.hidden ? "hidden: true" : null,
    agent.disabled ? "disabled: true" : null,
    agent.color ? `color: ${agent.color}` : null,
    permLines.length > 0 ? `permission:\n${permLines.join("\n")}` : null,
    "---",
    "",
    agent.prompt,
  ]
    .filter(Boolean)
    .join("\n")

  return frontmatter
}

export function downloadAgentFile(agent: Agent): void {
  const md = agentToMarkdown(agent)
  const blob = new Blob([md], { type: "text/markdown" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `${agent.name}.md`
  a.click()
  URL.revokeObjectURL(url)
}

export function downloadAllAgents(agents: Agent[]): void {
  const json = JSON.stringify(agents, null, 2)
  const blob = new Blob([json], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = "opencode-agents.json"
  a.click()
  URL.revokeObjectURL(url)
}
