import type { Agent } from "../types/agent.ts"
import { getAvailableSkills, type SkillInfo } from "./skills.ts"

export interface TeacherPlan {
  agentId: string
  agentName: string
  baselineScore: number
  lane: string
  recommendedSkills: SkillInfo[]
  configChanges: ConfigChange[]
  promptImprovements: string[]
  projectedScore: number
  githubSources: { name: string; stars: number; skills: number; url: string }[]
}

export interface ConfigChange {
  field: string
  oldValue: string
  newValue: string
  reason: string
}

const LANE_PATTERNS: Record<string, { keywords: string[]; temp: number; steps: number; model: string; edit: string }> = {
  "ux-review": { keywords: ["design", "ux", "ui", "heuristic", "accessibility", "interface"], temp: 0.3, steps: 10, model: "anthropic/claude-sonnet-4-6", edit: "deny" },
  psychology: { keywords: ["psychology", "behaviour", "cognitive", "bias", "motivation"], temp: 0.4, steps: 10, model: "anthropic/claude-sonnet-4-6", edit: "deny" },
  review: { keywords: ["review", "security", "audit", "vulnerability", "code"], temp: 0.1, steps: 10, model: "anthropic/claude-sonnet-4-6", edit: "deny" },
  docs: { keywords: ["docs", "documentation", "write", "readme", "api"], temp: 0.5, steps: 8, model: "anthropic/claude-haiku-4-20250514", edit: "allow" },
  debug: { keywords: ["debug", "bug", "fix", "error", "crash", "diagnostic"], temp: 0.15, steps: 15, model: "anthropic/claude-sonnet-4-6", edit: "ask" },
  test: { keywords: ["test", "qa", "spec", "coverage", "unit"], temp: 0.2, steps: 12, model: "anthropic/claude-sonnet-4-6", edit: "allow" },
  arch: { keywords: ["architect", "schema", "model", "api", "system", "database"], temp: 0.2, steps: 15, model: "anthropic/claude-sonnet-4-6", edit: "deny" },
  research: { keywords: ["research", "investigate", "analyze", "find", "search"], temp: 0.4, steps: 10, model: "anthropic/claude-sonnet-4-6", edit: "deny" },
}

const SKILL_LANE_MAP: Record<string, string[]> = {
  "ui-ux-pro-max": ["ux-review", "design"],
  "design-system": ["ux-review", "design"],
  "behavioural-psychology": ["psychology"],
  "code-review": ["review", "security"],
  "skill-security-auditor": ["review", "security"],
}

export const GITHUB_SOURCES = [
  { name: "nextlevelbuilder/ui-ux-pro-max-skill", stars: 111000, skills: 7, url: "https://github.com/nextlevelbuilder/ui-ux-pro-max-skill" },
  { name: "alirezarezvani/claude-skills", stars: 21000, skills: 355, url: "https://github.com/alirezarezvani/claude-skills" },
  { name: "nextlevelbuilder/goclaw", stars: 3500, skills: 6, url: "https://github.com/nextlevelbuilder/goclaw" },
  { name: "nextlevelbuilder/skillx", stars: 164, skills: 500, url: "https://github.com/nextlevelbuilder/skillx" },
  { name: "gideonfip/opencode-skills", stars: 2, skills: 5, url: "https://github.com/gideonfip/opencode-skills" },
]

function detectLane(agent: Agent): string {
  const text = `${agent.name} ${agent.description} ${agent.tags.join(" ")}`.toLowerCase()
  const scores = Object.entries(LANE_PATTERNS).map(([lane, cfg]) => {
    const score = cfg.keywords.filter((k) => text.includes(k)).length
    return { lane, score }
  })
  scores.sort((a, b) => b.score - a.score)
  return scores[0]?.lane ?? "general"
}

function computeBaselineScore(agent: Agent): number {
  let score = 100
  if (!agent.name || agent.name.length < 3) score -= 100
  if (!agent.description || agent.description.length < 20) score -= 10
  if (!agent.model?.includes("/")) score -= 10
  if (agent.temperature == null) score -= 10
  if (agent.steps == null || agent.steps < 3) score -= 10
  if (!agent.prompt || agent.prompt.length < 200) score -= 10
  if (!/Output|Format/.test(agent.prompt)) score -= 10
  if (!agent.prompt.startsWith("You are")) score -= 5
  if (!agent.color) score -= 5
  return Math.max(0, score)
}

export function teach(agent: Agent): TeacherPlan {
  const lane = detectLane(agent)
  const baselineScore = computeBaselineScore(agent)
  const laneCfg = LANE_PATTERNS[lane]
  const topSources = GITHUB_SOURCES.filter((s) => s.stars >= 100).sort((a, b) => b.stars - a.stars)

  const configChanges: ConfigChange[] = []
  const promptImprovements: string[] = []

  if (laneCfg) {
    if (agent.temperature !== laneCfg.temp) {
      configChanges.push({ field: "temperature", oldValue: `${agent.temperature}`, newValue: `${laneCfg.temp}`, reason: `${lane} lane: ${laneCfg.temp < 0.25 ? "analytical" : "creative"} task type` })
    }
    if (agent.steps !== laneCfg.steps) {
      configChanges.push({ field: "steps", oldValue: `${agent.steps}`, newValue: `${laneCfg.steps}`, reason: `${laneCfg.steps >= 12 ? "complex/long" : "standard"} task handling` })
    }
    if (!agent.model?.includes(laneCfg.model.split("/").pop()!)) {
      configChanges.push({ field: "model", oldValue: agent.model || "default", newValue: laneCfg.model, reason: `best model for ${lane} tasks` })
    }
  }

  if (!agent.prompt?.includes("ALWAYS load your skill")) {
    promptImprovements.push("Add mandatory skill-loading instruction at the top of the prompt")
  }
  if (!agent.prompt?.includes("Output")) {
    promptImprovements.push("Add structured output format section")
  }
  if (!agent.prompt?.startsWith("You are")) {
    promptImprovements.push("Add role definition as first sentence")
  }
  if (agent.prompt && agent.prompt.length < 200) {
    promptImprovements.push(`Expand prompt from ${agent.prompt.length} chars to 200+ with focus areas and guidance`)
  }

  const allSkills = getAvailableSkills()
  const recommendedSkills = allSkills.filter((s) => {
    const lanes = SKILL_LANE_MAP[s.name]
    return lanes?.includes(lane)
  })

  const projectedScore = Math.min(100, baselineScore + configChanges.length * 5 + promptImprovements.length * 5 + recommendedSkills.length * 5)

  return {
    agentId: agent.id,
    agentName: agent.name || "Unnamed",
    baselineScore,
    lane,
    recommendedSkills,
    configChanges,
    promptImprovements,
    projectedScore,
    githubSources: topSources,
  }
}
