import type { Agent } from "../types/agent.ts"
import { computeCapabilities, CAPABILITY_KEYS } from "../types/agent.ts"

export interface RoutingScore {
  agent: Agent
  score: number
  breakdown: {
    tagMatch: number
    descriptionMatch: number
    capabilityFit: number
    usageBonus: number
  }
}

function tokenize(text: string): Set<string> {
  return new Set(
    text.toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2)
  )
}

function cosineSimilarity(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0
  let intersection = 0
  for (const item of a) {
    if (b.has(item)) intersection++
  }
  return intersection / Math.sqrt(a.size * b.size)
}

const CAPABILITY_KEYWORDS: Record<string, string[]> = {
  toolAccess: ["tool", "access", "write", "edit", "file", "create", "modify", "permission", "bash", "shell", "execute"],
  responseAgility: ["fast", "quick", "rapid", "speed", "agile", "responsive", "haiku", "simple", "lightweight"],
  sessionResilience: ["long", "deep", "complex", "multi-step", "pipeline", "workflow", "chain", "persistent"],
  modelIntelligence: ["smart", "intelligent", "reason", "analyze", "complex", "research", "logic", "expert"],
  contextAwareness: ["context", "aware", "understand", "comprehensive", "thorough", "detailed", "full"],
  collaboration: ["team", "collaborate", "coordinate", "multi-agent", "orchestrate", "delegate", "together"],
}

function computeCapabilityFit(task: string, capabilities: Agent["capabilities"]): number {
  const taskTokens = tokenize(task)
  let totalFit = 0

  for (const key of CAPABILITY_KEYS) {
    const keywords = CAPABILITY_KEYWORDS[key]
    if (!keywords) continue
    const keywordSet = new Set(keywords)
    const overlap = cosineSimilarity(taskTokens, keywordSet)
    const capScore = capabilities[key] / 18
    totalFit += overlap * capScore
  }

  return totalFit / CAPABILITY_KEYS.length
}

export function rankAgents(task: string, agents: Agent[]): RoutingScore[] {
  const taskTokens = tokenize(task)
  const scored = agents
    .filter((a) => !a.disabled)
    .map((agent) => {
      const agentTags = new Set(agent.tags.map((t) => t.toLowerCase()))
      const tagMatch = cosineSimilarity(taskTokens, agentTags)

      const descTokens = tokenize(agent.description)
      const descriptionMatch = cosineSimilarity(taskTokens, descTokens)

      const caps = computeCapabilities(agent)
      const capabilityFit = computeCapabilityFit(task, caps)

      const recencyBonus = agent.lastUsed
        ? Math.max(0, 1 - (Date.now() - new Date(agent.lastUsed).getTime()) / (30 * 24 * 60 * 60 * 1000))
        : 0

      const weights = { tag: 0.35, desc: 0.25, cap: 0.25, usage: 0.15 }
      const score =
        tagMatch * weights.tag +
        descriptionMatch * weights.desc +
        capabilityFit * weights.cap +
        recencyBonus * weights.usage

      return {
        agent,
        score: Math.round(score * 1000) / 1000,
        breakdown: {
          tagMatch: Math.round(tagMatch * 1000) / 1000,
          descriptionMatch: Math.round(descriptionMatch * 1000) / 1000,
          capabilityFit: Math.round(capabilityFit * 1000) / 1000,
          usageBonus: Math.round(recencyBonus * weights.usage * 1000) / 1000,
        },
      }
    })

  scored.sort((a, b) => b.score - a.score)
  return scored
}

export function formatRoutingDecision(task: string, results: RoutingScore[]): string {
  if (results.length === 0) return "No available agents match this task."

  const top = results[0]!
  const lines = [
    `Task: "${task}"`,
    `→ Recommended: ${top.agent.name || "Unnamed"}`,
    `   Confidence: ${(top.score * 100).toFixed(1)}%`,
    `   Tags: ${top.agent.tags.join(", ") || "none"}`,
    `   Description: ${top.agent.description}`,
    ``,
    `Top 3 candidates:`,
  ]

  for (let i = 0; i < Math.min(3, results.length); i++) {
    const r = results[i]!
    lines.push(
      `  ${i + 1}. ${r.agent.name || "Unnamed"} (${(r.score * 100).toFixed(1)}%)` +
      `  ↳ tag:${r.breakdown.tagMatch} desc:${r.breakdown.descriptionMatch} cap:${r.breakdown.capabilityFit} recency:${r.breakdown.usageBonus}`
    )
  }

  return lines.join("\n")
}
