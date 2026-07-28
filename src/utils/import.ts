import type { Agent } from "../types/agent.ts"
import { generateId, rollStats } from "../types/agent.ts"

export function parseAgentMarkdown(md: string, fileName?: string): Partial<Agent> {
  const nameFromFile = fileName?.replace(/\.md$/i, "").trim() || "imported"

  const agent: Partial<Agent> = {
    id: generateId(),
    name: nameFromFile,
    description: "",
    mode: "subagent",
    model: "anthropic/claude-sonnet-4-6",
    prompt: "",
    temperature: null,
    topP: null,
    steps: null,
    hidden: false,
    disabled: false,
    color: null,
    permissions: {},
    mcpServers: {},
    plugins: [],
    commands: {},
    tags: [],
    dndStats: rollStats(),
    dndClass: "Wizard",
    dndLevel: 1,
    dndRace: "Human",
    dndAlignment: "Neutral Good",
    dndBackground: "Sage",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    sessionCount: 0,
    tokenCount: 0,
    lastUsed: null,
    isTemplate: false,
  }

  const fmMatch = md.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/)
  if (fmMatch) {
    const promptMatch = fmMatch[2]
    const fmMatch1 = fmMatch[1]
    if (promptMatch === undefined || fmMatch1 === undefined) return agent
    agent.prompt = promptMatch.trim()
    const lines = fmMatch1.split("\n")

    let currentSection = ""
    const frontmatter: Record<string, string | Record<string, string>> = {}
    const nested: Record<string, Record<string, string>> = {}

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith("#")) continue

      const colonIdx = trimmed.indexOf(":")
      if (colonIdx === -1) continue

      const key = trimmed.slice(0, colonIdx).trim().toLowerCase()
      const val = trimmed.slice(colonIdx + 1).trim()

      if (!val) {
        currentSection = key
        const empty: Record<string, string> = {}
        nested[currentSection] = empty
        frontmatter[currentSection] = empty
      } else if (currentSection && key && val) {
        const section = nested[currentSection]
        if (section) {
          section[key.replace(/"/g, "")] = val.replace(/"/g, "")
        }
      } else {
        frontmatter[key] = val.replace(/"/g, "")
      }
    }

    if (frontmatter.description) agent.description = String(frontmatter.description)
    if (frontmatter.mode) {
      const m = String(frontmatter.mode).toLowerCase()
      if (m === "primary" || m === "subagent" || m === "all") agent.mode = m
    }
    if (frontmatter.model) agent.model = String(frontmatter.model)
    if (frontmatter.temperature) agent.temperature = Number(frontmatter.temperature)
    if (frontmatter.top_p) agent.topP = Number(frontmatter.top_p)
    if (frontmatter.steps) agent.steps = Number(frontmatter.steps)
    if (String(frontmatter.hidden) === "true") agent.hidden = true
    if (String(frontmatter.disable) === "true" || String(frontmatter.disabled) === "true") agent.disabled = true
    if (frontmatter.color) agent.color = String(frontmatter.color)

    if (typeof frontmatter.tags === "string") {
      agent.tags = String(frontmatter.tags).split(",").map((t) => t.trim()).filter(Boolean)
    }

    if (frontmatter.permission && typeof frontmatter.permission === "object") {
      const parsed = frontmatter.permission as Record<string, unknown>
      const perms: Record<string, "allow" | "ask" | "deny"> = {}
      for (const [k, v] of Object.entries(parsed)) {
        if (v === "allow" || v === "ask" || v === "deny") perms[k] = v
      }
      agent.permissions = perms
    }
  } else {
    agent.prompt = md
  }

  return agent
}

export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsText(file)
  })
}
