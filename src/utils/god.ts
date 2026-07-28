import type { Agent } from "../types/agent.ts"
import { generateId } from "../types/agent.ts"
import { rankAgents } from "./router.ts"

export type TaskType = "review" | "write" | "debug" | "design" | "test" | "architect" | "research" | "general"

export interface GodPlan {
  task: string
  taskType: TaskType
  agent: Agent
  isNewlyCreated: boolean
  optimizations: {
    temperature: number
    steps: number
    model: string
  }
  expectedQuality: "high" | "medium" | "low"
  reasoning: string
}

const TASK_PATTERNS: Record<TaskType, RegExp[]> = {
  review: [/review/i, /audit/i, /security/i, /check/i, /inspect/i, /verify/i, /validate/i, /lint/i],
  write: [/write/i, /document/i, /readme/i, /api doc/i, /comment/i, /explain/i, /describe/i],
  debug: [/debug/i, /bug/i, /crash/i, /error/i, /fix/i, /broken/i, /stack trace/i, /issue/i, /fail/i],
  design: [/design/i, /ui/i, /ux/i, /layout/i, /component/i, /style/i, /css/i, /interface/i, /visual/i],
  test: [/test/i, /spec/i, /coverage/i, /unit/i, /e2e/i, /integration/i, /mock/i, /fixture/i],
  architect: [/architect/i, /schema/i, /model/i, /api/i, /endpoint/i, /database/i, /migration/i, /system/i],
  research: [/research/i, /investigate/i, /find/i, /search/i, /learn/i, /compare/i, /analyze/i],
  general: [/.*/],
}

const TASK_TRAITS: Record<TaskType, { tempRange: [number, number]; steps: number; model: string; tags: string[] }> = {
  review:   { tempRange: [0.1, 0.2], steps: 10, model: "anthropic/claude-sonnet-4-6", tags: ["review", "quality", "audit"] },
  write:    { tempRange: [0.4, 0.6], steps: 8, model: "anthropic/claude-haiku-4-20250514", tags: ["docs", "writing"] },
  debug:    { tempRange: [0.1, 0.2], steps: 15, model: "anthropic/claude-sonnet-4-6", tags: ["debug", "diagnostic"] },
  design:   { tempRange: [0.3, 0.5], steps: 10, model: "anthropic/claude-sonnet-4-6", tags: ["design", "ux", "ui"] },
  test:     { tempRange: [0.1, 0.3], steps: 12, model: "anthropic/claude-sonnet-4-6", tags: ["test", "qa"] },
  architect:{ tempRange: [0.2, 0.3], steps: 15, model: "anthropic/claude-sonnet-4-6", tags: ["architecture", "design"] },
  research: { tempRange: [0.3, 0.5], steps: 10, model: "anthropic/claude-sonnet-4-6", tags: ["research", "analysis"] },
  general:  { tempRange: [0.3, 0.5], steps: 8, model: "anthropic/claude-sonnet-4-6", tags: [] },
}

export function detectTaskType(task: string): TaskType {
  const scores: Record<TaskType, number> = {
    review: 0, write: 0, debug: 0, design: 0, test: 0, architect: 0, research: 0, general: 0,
  }
  for (const [type, patterns] of Object.entries(TASK_PATTERNS)) {
    for (const p of patterns) {
      if (p.test(task)) scores[type as TaskType]++
    }
  }
  const sorted = (Object.entries(scores) as [TaskType, number][]).sort((a, b) => b[1] - a[1])
  return sorted[0]![0]
}

function generateAgentName(task: string, taskType: TaskType): string {
  const words = task.toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/).filter((w) => w.length > 3)
  const key = words.slice(0, 3).join("-") || taskType
  return `${taskType}-${key}`
}

function generatePrompt(task: string, taskType: TaskType): string {
  const templates: Record<TaskType, string> = {
    review: `You are a code reviewer. Examine the following for issues and provide a severity-ranked report.

Task: ${task}

Focus on:
- Security vulnerabilities (injection, XSS, auth bypass, privilege escalation)
- Correctness (race conditions, edge cases, off-by-one, type confusion)
- Performance (N+1 queries, memory leaks, unnecessary allocations)
- Maintainability (complexity, duplication, unclear naming)

Output findings with severity ratings (P0-P4) and concrete fix suggestions.`,

    write: `You are a technical writer. Create clear, well-structured documentation.

Task: ${task}

Focus on:
- Clear explanations with proper structure
- Working code examples
- Consistent terminology
- User-friendly language

Output: polished documentation ready for publication.`,

    debug: `You are a debug specialist. Investigate and resolve the issue systematically.

Task: ${task}

Protocol:
1. Reproduce the problem and gather context
2. Trace execution path and identify root cause
3. Propose and verify the fix
4. Include a regression test

Output: root cause, fix, and regression test.`,

    design: `You are a design & UX specialist. Evaluate and improve the interface.

Task: ${task}

Focus on:
- Heuristic evaluation (visibility, consistency, error prevention, feedback)
- Accessibility (WCAG 2.2 AA, contrast, focus, screen reader)
- Design system consistency (tokens, states, composition)
- Information architecture (navigation, hierarchy, findability)

Output: structured findings with severity ratings and fix suggestions.`,

    test: `You are a testing specialist. Write and maintain tests.

Task: ${task}

Coverage:
- Unit tests for individual functions and components
- Integration tests for module interactions
- E2E tests for critical user flows
- Property-based tests for edge cases

Output: complete test files following project conventions.`,

    architect: `You are a system architect. Design and evaluate architecture.

Task: ${task}

Focus on:
- Module boundaries and separation of concerns
- Data models, schemas, and relationships
- API contracts and technology selection
- Trade-offs with alternatives considered

Output: architecture decision with rationale, options, and consequences.`,

    research: `You are a research specialist. Investigate and summarize findings.

Task: ${task}

Approach:
- Gather relevant information
- Analyze and synthesize findings
- Present clear conclusions with evidence

Output: structured research report.`,

    general: `You are a general-purpose assistant. Complete the following task thoroughly and accurately.

Task: ${task}

Output: complete, well-structured response.`,
  }
  return templates[taskType] || templates.general
}

function generatePermissions(taskType: TaskType): Agent["permissions"] {
  switch (taskType) {
    case "review":
    case "research":
      return { read: "allow", edit: "deny", bash: { "*": "ask", "git diff*": "allow", "grep *": "allow" } }
    case "write":
    case "test":
    case "debug":
      return { read: "allow", edit: "allow", bash: { "*": "ask", "npm test*": "allow" } }
    case "design":
    case "architect":
      return { read: "allow", edit: "deny", bash: { "*": "ask", "git diff*": "allow", "grep *": "allow" } }
    default:
      return { read: "allow", edit: "ask", bash: "ask" }
  }
}

export function createAgentForTask(task: string, taskType: TaskType): Agent {
  const name = generateAgentName(task, taskType)
  const traits = TASK_TRAITS[taskType]
  return {
    id: generateId(),
    name: name.slice(0, 48),
    description: `Auto-generated ${taskType} agent for: ${task.slice(0, 80)}`,
    mode: "subagent",
    model: traits.model,
    prompt: generatePrompt(task, taskType),
    temperature: traits.tempRange[0],
    topP: null,
    steps: traits.steps,
    hidden: false,
    disabled: false,
    color: null,
    permissions: generatePermissions(taskType),
    mcpServers: {},
    plugins: [],
    commands: {},
    tags: [taskType, ...task.toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/).filter((w) => w.length > 3).slice(0, 3)],
    capabilities: { toolAccess: 10, responseAgility: 10, sessionResilience: 10, modelIntelligence: 10, contextAwareness: 10, collaboration: 10 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    sessionCount: 0,
    tokenCount: 0,
    lastUsed: null,
    isTemplate: false,
  }
}

const MATCH_THRESHOLD = 0.15

export function plan(task: string, agents: Agent[]): GodPlan {
  const taskType = detectTaskType(task)
  const ranked = rankAgents(task, agents.filter((a) => !a.isTemplate))

  const traits = TASK_TRAITS[taskType]
  const midTemp = (traits.tempRange[0] + traits.tempRange[1]) / 2

  let agent: Agent
  let isNewlyCreated = false
  let reasoning: string

  if (ranked.length > 0 && ranked[0]!.score >= MATCH_THRESHOLD) {
    agent = ranked[0]!.agent
    const pct = (ranked[0]!.score * 100).toFixed(1)
    reasoning = `Selected "${agent.name}" (${pct}% match) for ${taskType} task. ` +
      `Score breakdown: tag=${ranked[0]!.breakdown.tagMatch} desc=${ranked[0]!.breakdown.descriptionMatch} cap=${ranked[0]!.breakdown.capabilityFit}.`
  } else {
    agent = createAgentForTask(task, taskType)
    isNewlyCreated = true
    reasoning = `No existing agent exceeded the match threshold (${(MATCH_THRESHOLD * 100).toFixed(0)}%). ` +
      `Created new "${taskType}" agent tailored to this task.`
  }

  const optimizations = {
    temperature: midTemp,
    steps: traits.steps,
    model: traits.model,
  }

  const qualityScore = ranked.length > 0 && ranked[0]!.score >= MATCH_THRESHOLD
    ? ranked[0]!.score
    : 0.3
  const expectedQuality = qualityScore >= 0.5 ? "high" : qualityScore >= 0.25 ? "medium" : "low" as const

  return {
    task,
    taskType,
    agent,
    isNewlyCreated,
    optimizations,
    expectedQuality,
    reasoning,
  }
}
