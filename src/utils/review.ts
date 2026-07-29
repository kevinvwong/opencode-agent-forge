import type { Agent } from "../types/agent.ts"

export interface AgentReview {
  agentId: string; agentName: string
  overview: { factual: number; quantifiable: number; qualifiable: number }
  checks: ReviewCheck[]; summary: string; issues: number; score: number
}
export interface ReviewCheck { category: "factual" | "quantifiable" | "qualifiable"; label: string; status: "pass" | "warn" | "fail"; detail: string }

const CHECKS = [
  { cat: "factual" as const, label: "Name is valid kebab-case", fn: (a: Agent) => /^[a-z0-9-]+$/.test(a.name) ? { s: "pass" as const, d: `"${a.name}"` } : { s: "fail" as const, d: "Invalid format" } },
  { cat: "factual" as const, label: "Description ≥20 chars", fn: (a: Agent) => a.description.length >= 20 ? { s: "pass" as const, d: `${a.description.length} chars` } : { s: "fail" as const, d: "Too short" } },
  { cat: "factual" as const, label: "Mode is valid", fn: (a: Agent) => ["primary", "subagent", "all"].includes(a.mode) ? { s: "pass" as const, d: a.mode } : { s: "fail" as const, d: `Invalid: ${a.mode}` } },
  { cat: "factual" as const, label: "Model is valid", fn: (a: Agent) => a.model.includes("/") ? { s: "pass" as const, d: a.model.split("/").pop()! } : { s: "warn" as const, d: "No model field" } },
  { cat: "factual" as const, label: "Permission block exists", fn: (a: Agent) => a.permissions ? { s: "pass" as const, d: `${Object.keys(a.permissions).length} entries` } : { s: "fail" as const, d: "Missing" } },
  { cat: "quantifiable" as const, label: "Has trigger keywords", fn: (a: Agent) => (a.description.match(/[,\s]+/g)?.length ?? 0) >= 3 ? { s: "pass" as const, d: "3+ triggers" } : { s: "warn" as const, d: "Fewer than 3" } },
  { cat: "quantifiable" as const, label: "Temperature set", fn: (a: Agent) => a.temperature != null ? { s: "pass" as const, d: `${a.temperature}` } : { s: "warn" as const, d: "Using default" } },
  { cat: "quantifiable" as const, label: "Steps configured", fn: (a: Agent) => a.steps != null && a.steps >= 3 ? { s: "pass" as const, d: `${a.steps}` } : { s: "warn" as const, d: "Not set or <3" } },
  { cat: "quantifiable" as const, label: "Prompt body ≥200 chars", fn: (a: Agent) => a.prompt.length >= 200 ? { s: "pass" as const, d: `${a.prompt.length} chars` } : { s: "warn" as const, d: `${a.prompt.length} chars` } },
  { cat: "quantifiable" as const, label: "Output format in prompt", fn: (a: Agent) => /Output|Format|---/.test(a.prompt) ? { s: "pass" as const, d: "Found" } : { s: "warn" as const, d: "Missing" } },
  { cat: "quantifiable" as const, label: "Perms match role", fn: (a: Agent) => { const e = a.permissions?.edit; return e === "deny" || e === "allow" ? { s: "pass" as const, d: `edit:${e}` } : { s: "warn" as const, d: `edit:${e ?? "not set"}` } } },
  { cat: "quantifiable" as const, label: "Triggers relate to body", fn: (a: Agent) => { const kws = a.description.toLowerCase().split(/[,:\s]+/).filter((w) => w.length > 3).slice(0, 5); return kws.some((k) => a.prompt.toLowerCase().includes(k)) ? { s: "pass" as const, d: "Match" } : { s: "warn" as const, d: "No overlap" } } },
  { cat: "qualifiable" as const, label: "Has production usage", fn: (a: Agent) => a.sessionCount > 0 || a.lastUsed ? { s: "pass" as const, d: `${a.sessionCount} sessions` } : { s: "sugg" as const, d: "Unused" } },
  { cat: "qualifiable" as const, label: "Color set", fn: (a: Agent) => a.color ? { s: "pass" as const, d: a.color } : { s: "sugg" as const, d: "Missing" } },
  { cat: "qualifiable" as const, label: "No duplicate name", fn: (_: Agent, all: Agent[]) => { const dupe = all.filter((a) => a.name === _.name); return dupe.length <= 1 ? { s: "pass" as const, d: "Unique" } : { s: "sugg" as const, d: `Duplicated ${dupe.length}x` } } },
  { cat: "qualifiable" as const, label: "Starts with role definition", fn: (a: Agent) => /^You are (a|an)/.test(a.prompt.trim()) ? { s: "pass" as const, d: "Has role" } : { s: "sugg" as const, d: "Missing" } },
]

const TIER: Record<string, number> = { pass: 0, warn: 10, sugg: 5, fail: Infinity }

function calcCategory(cat: string, checks: ReviewCheck[]): number {
  const inCat = checks.filter((c) => c.category === cat)
  if (inCat.length === 0) return 100
  const passed = inCat.filter((c) => c.status === "pass").length
  return Math.round((passed / inCat.length) * 100)
}

export function reviewAgent(agent: Agent, allAgents?: Agent[]): AgentReview {
  const checks = CHECKS.map((c) => {
    const r = c.fn(agent, allAgents ?? [agent])
    return { category: c.cat, label: c.label, status: r.s, detail: r.d } as ReviewCheck
  })
  const score = Math.max(0, 100 - checks.reduce((p, c) => p + (TIER[c.status] ?? 0), 0))
  const issues = checks.filter((c) => c.status === "fail").length
  const pass = checks.filter((c) => c.status === "pass").length
  const warn = checks.filter((c) => c.status === "warn").length
  const fail = checks.filter((c) => c.status === "fail").length
  return {
    agentId: agent.id, agentName: agent.name || "Unnamed",
    overview: {
      factual: calcCategory("factual", checks),
      quantifiable: calcCategory("quantifiable", checks),
      qualifiable: calcCategory("qualifiable", checks),
    },
    checks, summary: `${agent.name}: ${score}% (${pass}p ${warn}w ${fail}f)`, issues, score,
  }
}

export const reviewAllAgents = (agents: Agent[]) =>
  agents.filter((a) => !a.isTemplate).map((a) => reviewAgent(a, agents)).sort((a, b) => a.score - b.score)
