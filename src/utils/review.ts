import type { Agent } from "../types/agent.ts"
import { computeCapabilities, CAPABILITY_KEYS, TOOL_LABELS } from "../types/agent.ts"

export interface AgentReview {
  agentId: string
  agentName: string
  overview: ReviewScore
  checks: ReviewCheck[]
  summary: string
  issues: number
  score: number
}

export interface ReviewScore {
  factual: number
  quantifiable: number
  qualifiable: number
}

export interface ReviewCheck {
  category: "factual" | "quantifiable" | "qualifiable"
  label: string
  status: "pass" | "warn" | "fail"
  detail: string
}

function computeStatsSpread(agent: Agent): number {
  const caps = computeCapabilities(agent)
  const vals = CAPABILITY_KEYS.map((k) => caps[k])
  const max = Math.max(...vals)
  const min = Math.min(...vals)
  return max - min
}

function countSetPermissions(agent: Agent): number {
  let count = 0
  for (const key of Object.keys(TOOL_LABELS)) {
    const v = agent.permissions[key]
    if (v === "allow" || v === "ask" || v === "deny") count++
    else if (typeof v === "object" && v !== null) count++
  }
  return count
}

const MODEL_TIERS: Record<string, string> = {
  "claude-sonnet-4": "high",
  "claude-haiku-4": "medium",
  "gpt-5": "high",
  "gpt-5-codex": "high",
  "gpt-5.1-codex": "high",
}

export function reviewAgent(agent: Agent): AgentReview {
  const checks: ReviewCheck[] = []

  // -- factual checks --
  if (agent.name && agent.name.length > 2) {
    checks.push({ category: "factual", label: "Agent name is descriptive", status: "pass", detail: `"${agent.name}" (${agent.name.length} chars)` })
  } else {
    checks.push({ category: "factual", label: "Agent name is descriptive", status: "fail", detail: "Name is empty or too short to be meaningful" })
  }

  if (agent.description && agent.description.length > 20) {
    checks.push({ category: "factual", label: "Description explains purpose", status: "pass", detail: `${agent.description.length} chars — clearly describes the agent's role` })
  } else if (agent.description && agent.description.length > 5) {
    checks.push({ category: "factual", label: "Description explains purpose", status: "warn", detail: `${agent.description.length} chars — consider expanding for clarity` })
  } else {
    checks.push({ category: "factual", label: "Description explains purpose", status: "fail", detail: "Description is missing or too short" })
  }

  if (agent.tags.length > 0) {
    const relevant = agent.tags.some((t) => agent.description.toLowerCase().includes(t.toLowerCase()) || agent.name.toLowerCase().includes(t.toLowerCase()))
    if (relevant) {
      checks.push({ category: "factual", label: "Tags align with agent identity", status: "pass", detail: `Tags [${agent.tags.join(", ")}] reflect the agent's purpose` })
    } else {
      checks.push({ category: "factual", label: "Tags align with agent identity", status: "warn", detail: `Tags [${agent.tags.join(", ")}] don't appear in name or description` })
    }
  } else {
    checks.push({ category: "factual", label: "Tags align with agent identity", status: "warn", detail: "No tags defined — reduces discoverability" })
  }

  // -- quantifiable checks --
  const permsCount = countSetPermissions(agent)
  if (permsCount >= 8) {
    checks.push({ category: "quantifiable", label: "Permissions are explicitly configured", status: "pass", detail: `${permsCount}/16 tools explicitly set` })
  } else if (permsCount >= 3) {
    checks.push({ category: "quantifiable", label: "Permissions are explicitly configured", status: "warn", detail: `Only ${permsCount}/16 tools explicitly set — relies on defaults` })
  } else {
    checks.push({ category: "quantifiable", label: "Permissions are explicitly configured", status: "fail", detail: `Only ${permsCount}/16 tools set — agent may not function as expected` })
  }

  const spread = computeStatsSpread(agent)
  if (spread >= 4) {
    checks.push({ category: "quantifiable", label: "Capability scores are differentiated", status: "pass", detail: `Spread of ${spread} points — shows clear strengths/weaknesses` })
  } else if (spread >= 2) {
    checks.push({ category: "quantifiable", label: "Capability scores are differentiated", status: "warn", detail: `Spread of only ${spread} points — capabilities are mostly flat` })
  } else {
    checks.push({ category: "quantifiable", label: "Capability scores are differentiated", status: "fail", detail: `All scores nearly identical (spread ${spread}) — not data-driven` })
  }

  if (agent.model) {
    const modelShort = agent.model.split("/").pop() || agent.model
    const tier = Object.entries(MODEL_TIERS).find(([k]) => modelShort.includes(k))
    checks.push({ category: "quantifiable", label: "Model is appropriate for task", status: "pass", detail: `${modelShort} — ${tier ? tier[1] : "standard"} capability tier` })
  } else {
    checks.push({ category: "quantifiable", label: "Model is appropriate for task", status: "fail", detail: "No model selected" })
  }

  if (agent.temperature != null) {
    const desc = agent.temperature < 0.2 ? "deterministic" : agent.temperature > 0.5 ? "creative" : "balanced"
    checks.push({ category: "quantifiable", label: "Temperature is tuned for purpose", status: "pass", detail: `${agent.temperature} — ${desc}` })
  } else {
    checks.push({ category: "quantifiable", label: "Temperature is tuned for purpose", status: "warn", detail: "Using default — consider setting explicitly" })
  }

  if (agent.steps != null) {
    const desc = agent.steps >= 10 ? "adequate for complex tasks" : "limited"
    checks.push({ category: "quantifiable", label: "Max steps are configured", status: "pass", detail: `${agent.steps} steps — ${desc}` })
  } else {
    checks.push({ category: "quantifiable", label: "Max steps are configured", status: "warn", detail: "Unlimited — agent may loop on complex tasks" })
  }

  // -- qualifiable checks --
  if (agent.prompt && agent.prompt.length > 200) {
    checks.push({ category: "qualifiable", label: "System prompt is substantive", status: "pass", detail: `${agent.prompt.length} chars with clear instructions` })
  } else if (agent.prompt && agent.prompt.length > 50) {
    checks.push({ category: "qualifiable", label: "System prompt is substantive", status: "warn", detail: `Only ${agent.prompt.length} chars — may lack sufficient guidance` })
  } else {
    checks.push({ category: "qualifiable", label: "System prompt is substantive", status: "fail", detail: "Prompt is empty or too short to be effective" })
  }

  const promptHasStructure = /output|format|follow|steps?:\s*\d|focus|cover/i.test(agent.prompt)
  if (promptHasStructure) {
    checks.push({ category: "qualifiable", label: "Prompt has structured output guidance", status: "pass", detail: "Includes output format, steps, or focus areas" })
  } else if (agent.prompt.length > 50) {
    checks.push({ category: "qualifiable", label: "Prompt has structured output guidance", status: "warn", detail: "No explicit output format — add structure for better results" })
  }

  if (agent.sessionCount > 0) {
    checks.push({ category: "qualifiable", label: "Agent has been used in production", status: "pass", detail: `${agent.sessionCount} session${agent.sessionCount !== 1 ? "s" : ""} completed` })
  } else {
    checks.push({ category: "qualifiable", label: "Agent has been used in production", status: "warn", detail: "No usage history — untested" })
  }

  const passCount = checks.filter((c) => c.status === "pass").length
  const warnCount = checks.filter((c) => c.status === "warn").length
  const failCount = checks.filter((c) => c.status === "fail").length

  const factualChecks = checks.filter((c) => c.category === "factual")
  const quantChecks = checks.filter((c) => c.category === "quantifiable")
  const qualChecks = checks.filter((c) => c.category === "qualifiable")

  const factual = factualChecks.length > 0 ? factualChecks.filter((c) => c.status === "pass").length / factualChecks.length : 0
  const quantifiable = quantChecks.length > 0 ? quantChecks.filter((c) => c.status === "pass").length / quantChecks.length : 0
  const qualifiable = qualChecks.length > 0 ? qualChecks.filter((c) => c.status === "pass").length / qualChecks.length : 0

  const score = checks.length > 0 ? Math.round((passCount / checks.length) * 100) : 0

  const issues = failCount
  const severity = failCount > 0 ? "issues" : warnCount > 0 ? "warnings" : "clean"
  const summary = `${agent.name || "Unnamed"}: ${score}% score (${passCount} pass, ${warnCount} warn, ${failCount} fail). ${failCount > 0 ? `${failCount} ${severity} found.` : warnCount > 0 ? `${warnCount} minor ${severity}.` : "All checks passed."}`

  return {
    agentId: agent.id,
    agentName: agent.name || "Unnamed",
    overview: { factual: Math.round(factual * 100), quantifiable: Math.round(quantifiable * 100), qualifiable: Math.round(qualifiable * 100) },
    checks,
    summary,
    issues,
    score,
  }
}

export function reviewAllAgents(agents: Agent[]): AgentReview[] {
  return agents.filter((a) => !a.isTemplate).map(reviewAgent).sort((a, b) => a.score - b.score)
}
