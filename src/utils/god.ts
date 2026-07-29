import type { Agent } from "../types/agent.ts"
import { generateId, computeCapabilities } from "../types/agent.ts"
import { rankAgents } from "./router.ts"

export type TaskType = "review" | "write" | "debug" | "design" | "test" | "architect" | "research" | "general"

export interface GodPlan {
  task: string
  taskType: TaskType
  agent: Agent
  isNewlyCreated: boolean
  optimizations: { temperature: number; steps: number; model: string }
  expectedQuality: "high" | "medium" | "low"
  reasoning: string
}

const CFG: Record<TaskType, {
  patterns: RegExp[]
  role: string
  focus: string[]
  temp: number
  steps: number
  model: string
  tags: string[]
  edit: "allow" | "deny" | "ask"
}> = {
  review:    { patterns: [/review/i, /audit/i, /security/i, /check/i, /inspect/i, /verify/i, /validate/i, /lint/i], role: "code reviewer", focus: ["Security: injection, XSS, auth bypass, privilege escalation", "Correctness: race conditions, edge cases, off-by-one", "Performance: N+1 queries, memory leaks", "Maintainability: complexity, duplication, naming"], temp: 0.1, steps: 10, model: "anthropic/claude-sonnet-4-6", tags: ["review", "quality", "audit"], edit: "deny" },
  write:     { patterns: [/write/i, /document/i, /readme/i, /api doc/i, /comment/i, /explain/i, /describe/i], role: "technical writer", focus: ["Clear explanations with proper structure", "Working code examples", "Consistent terminology", "User-friendly language"], temp: 0.5, steps: 8, model: "anthropic/claude-haiku-4-20250514", tags: ["docs", "writing"], edit: "allow" },
  debug:     { patterns: [/debug/i, /bug/i, /crash/i, /error/i, /fix/i, /broken/i, /stack trace/i, /issue/i, /fail/i], role: "debug specialist", focus: ["1. Reproduce problem and gather context", "2. Trace execution path, identify root cause", "3. Propose and verify fix", "4. Include regression test"], temp: 0.15, steps: 15, model: "anthropic/claude-sonnet-4-6", tags: ["debug", "diagnostic"], edit: "ask" },
  design:    { patterns: [/design/i, /ui/i, /ux/i, /layout/i, /component/i, /style/i, /css/i, /interface/i, /visual/i], role: "design & UX specialist", focus: ["Heuristic evaluation: visibility, consistency, error prevention", "Accessibility: WCAG 2.2 AA, contrast, focus, screen reader", "Design system: tokens, states, composition", "Information architecture: navigation, hierarchy"], temp: 0.4, steps: 10, model: "anthropic/claude-sonnet-4-6", tags: ["design", "ux", "ui"], edit: "deny" },
  test:      { patterns: [/test/i, /spec/i, /coverage/i, /unit/i, /e2e/i, /integration/i, /mock/i, /fixture/i], role: "testing specialist", focus: ["Unit tests for functions and components", "Integration tests for module interactions", "E2E tests for critical user flows", "Property-based tests for edge cases"], temp: 0.2, steps: 12, model: "anthropic/claude-sonnet-4-6", tags: ["test", "qa"], edit: "allow" },
  architect: { patterns: [/architect/i, /schema/i, /model/i, /api/i, /endpoint/i, /database/i, /migration/i, /system/i], role: "system architect", focus: ["Module boundaries and separation of concerns", "Data models, schemas, and relationships", "API contracts and technology selection", "Trade-offs with alternatives considered"], temp: 0.2, steps: 15, model: "anthropic/claude-sonnet-4-6", tags: ["architecture", "design"], edit: "deny" },
  research:  { patterns: [/research/i, /investigate/i, /find/i, /search/i, /learn/i, /compare/i, /analyze/i], role: "research specialist", focus: ["Gather relevant information", "Analyze and synthesize findings", "Present clear conclusions with evidence"], temp: 0.4, steps: 10, model: "anthropic/claude-sonnet-4-6", tags: ["research", "analysis"], edit: "deny" },
  general:   { patterns: [/.*/], role: "general-purpose assistant", focus: ["Complete the task thoroughly and accurately"], temp: 0.3, steps: 8, model: "anthropic/claude-sonnet-4-6", tags: [], edit: "ask" },
}

export function detectTaskType(task: string): TaskType {
  const scores = Object.fromEntries(Object.keys(CFG).map((t) => [t, 0])) as Record<TaskType, number>
  for (const [type, cfg] of Object.entries(CFG)) {
    for (const p of cfg.patterns) { if (p.test(task)) scores[type as TaskType]++ }
  }
  return (Object.entries(scores) as [TaskType, number][]).sort((a, b) => b[1] - a[1])[0]![0]
}

function kebabWords(s: string): string[] {
  return s.toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/).filter((w) => w.length > 3).slice(0, 3)
}

export function createAgentForTask(task: string, taskType: TaskType): Agent {
  const c = CFG[taskType]
  const words = kebabWords(task)
  const name = `${taskType}-${(words.join("-") || taskType).slice(0, 48)}`
  const description = `Auto-generated ${taskType} agent for: ${task.slice(0, 80)}`
  const prompt = [
    `You are a ${c.role}.`, "",
    `Task: ${task}`, "",
    "Focus on:", ...c.focus.map((f) => `- ${f}`), "",
    "Output: complete, well-structured result.",
  ].join("\n")
  const perms: Agent["permissions"] = c.edit === "allow"
    ? { read: "allow", edit: "allow", bash: { "*": "ask", "npm test*": "allow" } }
    : c.edit === "deny"
    ? { read: "allow", edit: "deny", bash: { "*": "ask", "git diff*": "allow", "grep *": "allow" } }
    : { read: "allow", edit: "ask", bash: "ask" }

  return {
    id: generateId(), name, mode: "subagent",
    description, model: c.model, prompt,
    temperature: c.temp, topP: null, steps: c.steps,
    hidden: false, disabled: false, color: null, permissions: perms,
    mcpServers: {}, plugins: [], commands: {},
    tags: [taskType, ...words],
    capabilities: computeCapabilities({
      model: c.model, mode: "subagent", permissions: perms,
      steps: c.steps, temperature: c.temp, prompt, description, tags: [taskType],
    }),
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    sessionCount: 0, tokenCount: 0, lastUsed: null, isTemplate: false,
  }
}

const MATCH_THRESHOLD = 0.15

export function plan(task: string, agents: Agent[]): GodPlan {
  const taskType = detectTaskType(task)
  const ranked = rankAgents(task, agents.filter((a) => !a.isTemplate))
  const c = CFG[taskType]

  if (ranked.length > 0 && ranked[0]!.score >= MATCH_THRESHOLD) {
    const r = ranked[0]!
    return {
      task, taskType, agent: r.agent, isNewlyCreated: false,
      optimizations: { temperature: c.temp, steps: c.steps, model: c.model },
      expectedQuality: r.score >= 0.5 ? "high" : r.score >= 0.25 ? "medium" : "low",
      reasoning: `Selected "${r.agent.name}" (${(r.score * 100).toFixed(1)}% match) for ${taskType}. tag:${r.breakdown.tagMatch} desc:${r.breakdown.descriptionMatch} cap:${r.breakdown.capabilityFit}.`,
    }
  }

  const agent = createAgentForTask(task, taskType)
  return {
    task, taskType, agent, isNewlyCreated: true,
    optimizations: { temperature: c.temp, steps: c.steps, model: c.model },
    expectedQuality: "medium",
    reasoning: `No agent ≥${(MATCH_THRESHOLD * 100).toFixed(0)}% match. Created new ${taskType} agent.`,
  }
}
