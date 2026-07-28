import type { Agent, PermissionLevel, BashPermission } from "../types/agent.ts"

function formatPermission(value: PermissionLevel | BashPermission | undefined): string {
  if (!value) return "deny"
  if (typeof value === "string") return value
  const lines = Object.entries(value).map(([k, v]) => `    "${k}": "${v}"`)
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
    agent.disabled ? "disable: true" : null,
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

export function parseAgentMarkdown(md: string, id: string, name: string): Partial<Agent> {
  const agent: Partial<Agent> = { id, name }

  const fmMatch = md.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/)
  if (!fmMatch) {
    agent.prompt = md
    return agent
  }

  agent.prompt = fmMatch[2].trim()
  const fm = fmMatch[1]

  const lines = fm.split("\n")
    let currentKey = ""
    const parsed: Record<string, unknown> = {}

  for (const line of lines) {
    const trimmed = line.trim()

    if (trimmed.includes(":")) {
      const colonIdx = trimmed.indexOf(":")
      const key = trimmed.slice(0, colonIdx).trim()
      let val: string | undefined = trimmed.slice(colonIdx + 1).trim()

      if (val === "" || val === undefined) {
        currentKey = key
        parsed[key] = {}
      } else {
        if (key === "true" || key === "false") {
          if (typeof parsed[currentKey] === "object" && parsed[currentKey] !== null) {
            ;(parsed[currentKey] as Record<string, unknown>)[key] = val
          }
        } else {
          if (val === "true") val = "true"
          else if (val === "false") val = "false"
          parsed[key] = val
        }
        currentKey = key
      }
    } else if (trimmed && currentKey) {
      if (typeof parsed[currentKey] === "object" && parsed[currentKey] !== null) {
        const subMatch = trimmed.match(/^"([^"]+)"\s*:\s*"([^"]*)"$/)
        if (subMatch) {
          ;(parsed[currentKey] as Record<string, string>)[subMatch[1]] = subMatch[2]
        }
      }
    }
  }

  if (parsed.description) agent.description = String(parsed.description)
  if (parsed.mode) agent.mode = String(parsed.mode) as Agent["mode"]
  if (parsed.model) agent.model = String(parsed.model)
  if (parsed.temperature) agent.temperature = Number(parsed.temperature)
  if (parsed.top_p) agent.topP = Number(parsed.top_p)
  if (parsed.steps) agent.steps = Number(parsed.steps)
  if (parsed["hidden"]) agent.hidden = true
  if (parsed["disable"]) agent.disabled = true
  if (parsed.color) agent.color = String(parsed.color)
  if (parsed.permission && typeof parsed.permission === "object") {
    agent.permissions = parsed.permission as Agent["permissions"]
  }

  return agent
}
