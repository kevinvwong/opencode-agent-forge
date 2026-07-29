export type AgentMode = "primary" | "subagent" | "all"

export type PermissionLevel = "allow" | "ask" | "deny"

export interface BashPermission {
  "*"?: PermissionLevel
  [pattern: string]: PermissionLevel | undefined
}

export interface AgentPermissions {
  read?: PermissionLevel | BashPermission
  edit?: PermissionLevel | BashPermission
  write?: PermissionLevel | BashPermission
  apply_patch?: PermissionLevel | BashPermission
  glob?: PermissionLevel | BashPermission
  grep?: PermissionLevel | BashPermission
  list?: PermissionLevel | BashPermission
  bash?: PermissionLevel | BashPermission
  task?: PermissionLevel | BashPermission
  external_directory?: PermissionLevel | BashPermission
  todowrite?: PermissionLevel | BashPermission
  webfetch?: PermissionLevel | BashPermission
  websearch?: PermissionLevel | BashPermission
  lsp?: PermissionLevel | BashPermission
  skill?: PermissionLevel | BashPermission
  question?: PermissionLevel | BashPermission
  [tool: string]: PermissionLevel | BashPermission | undefined
}

export interface MCPConfig {
  type: "local" | "remote"
  command?: string[]
  url?: string
  enabled: boolean
  environment?: Record<string, string>
  headers?: Record<string, string>
}

export interface AgentCapabilities {
  toolAccess: number
  responseAgility: number
  sessionResilience: number
  modelIntelligence: number
  contextAwareness: number
  collaboration: number
}

export interface AgentMetrics {
  sessionCapacity: number
  securityRating: number
  responsiveness: number
  proficiency: number
}

export interface Agent {
  id: string
  name: string
  description: string
  mode: AgentMode
  model: string
  prompt: string
  temperature: number | null
  topP: number | null
  steps: number | null
  hidden: boolean
  disabled: boolean
  color: string | null
  permissions: AgentPermissions
  mcpServers: Record<string, MCPConfig>
  plugins: string[]
  commands: Record<string, string>
  tags: string[]
  capabilities: AgentCapabilities
  createdAt: string
  updatedAt: string
  sessionCount: number
  tokenCount: number
  lastUsed: string | null
  isTemplate: boolean
}

export const CAPABILITY_LABELS: Record<keyof AgentCapabilities, string> = {
  toolAccess: "TAC",
  responseAgility: "RAG",
  sessionResilience: "SRS",
  modelIntelligence: "MIT",
  contextAwareness: "CAW",
  collaboration: "COL",
}

export const CAPABILITY_FULL: Record<keyof AgentCapabilities, string> = {
  toolAccess: "Tool Access",
  responseAgility: "Response Agility",
  sessionResilience: "Session Resilience",
  modelIntelligence: "Model Intelligence",
  contextAwareness: "Context Awareness",
  collaboration: "Collaboration",
}

export const CAPABILITY_COLORS: Record<keyof AgentCapabilities, string> = {
  toolAccess: "#dc2626",
  responseAgility: "#ea580c",
  sessionResilience: "#16a34a",
  modelIntelligence: "#2563eb",
  contextAwareness: "#0891b2",
  collaboration: "#db2777",
}

export const MODE_LABELS: Record<AgentMode, string> = {
  primary: "Primary",
  subagent: "Subagent",
  all: "All",
}

export const MODE_COLORS: Record<AgentMode, string> = {
  primary: "#dc2626",
  subagent: "#5599ff",
  all: "#d4a843",
}

export const TOOL_LABELS: Record<string, string> = {
  read: "Read",
  write: "Write",
  edit: "Edit",
  apply_patch: "Patch",
  glob: "Glob",
  grep: "Grep",
  list: "List",
  bash: "Bash",
  task: "Task",
  external_directory: "Ext. Dir",
  todowrite: "Todo",
  webfetch: "Web Fetch",
  websearch: "Web Search",
  lsp: "LSP",
  skill: "Skill",
  question: "Question",
}

export const TOOL_DESCRIPTIONS: Record<string, string> = {
  read: "Read file contents",
  write: "Create new files",
  edit: "Modify existing files",
  apply_patch: "Apply patches",
  glob: "Search file patterns",
  grep: "Search file contents",
  list: "List directory contents",
  bash: "Execute shell commands",
  task: "Invoke subagents",
  external_directory: "Access files outside project",
  todowrite: "Manage task lists",
  webfetch: "Fetch web URLs",
  websearch: "Search the web",
  lsp: "Language Server Protocol",
  skill: "Load skills",
  question: "Ask user questions",
}

export const CAPABILITY_KEYS: (keyof AgentCapabilities)[] = [
  "toolAccess",
  "responseAgility",
  "sessionResilience",
  "modelIntelligence",
  "contextAwareness",
  "collaboration",
]

export function capModifier(score: number): number {
  return Math.floor((score - 10) / 2)
}

type AgentLike = {
  model: string; mode: AgentMode; permissions: AgentPermissions
  steps: number | null; temperature: number | null
  prompt: string; description: string; tags: string[]
}

function modelSpeedRank(m: string): number {
  const s = m.toLowerCase()
  if (s.includes("haiku")) return 5
  if (s.includes("sonnet")) return 3
  return 1
}

function modelTier(m: string): number {
  const s = m.toLowerCase()
  if (s.includes("gpt-5")) return 5
  if (s.includes("sonnet-4")) return 4
  if (s.includes("codex")) return 3
  if (s.includes("haiku-4")) return 2
  return 3
}

function modelContextWindow(m: string): number {
  const s = m.toLowerCase()
  if (s.includes("haiku") || s.includes("sonnet") || s.includes("gpt")) return 200_000
  return 128_000
}

function countLevel(perms: AgentPermissions, lvl: string): number {
  let n = 0
  for (const k of Object.keys(TOOL_LABELS)) {
    const v = perms[k]
    if (typeof v === "string" && v === lvl) n++
  }
  return n
}

function clampToStat(v: number): number {
  return Math.max(3, Math.min(18, Math.round(v)))
}

export function computeCapabilities(a: AgentLike): AgentCapabilities {
  const toolAccess = clampToStat(6 + countLevel(a.permissions, "allow") * 2 + countLevel(a.permissions, "ask"))

  const responseAgility = clampToStat(6 + modelSpeedRank(a.model) * 2 + (a.temperature ?? 0.5) * 2)

  const sessionResilience = a.steps === null ? 18
    : a.steps >= 20 ? 18 : a.steps >= 10 ? 16 : a.steps >= 5 ? 14 : a.steps >= 3 ? 12 : 10

  const modelIntelligence = clampToStat(6 + modelTier(a.model) * 2.5)

  const windowK = modelContextWindow(a.model) / 1000
  const usedRatio = Math.min(a.prompt.length / modelContextWindow(a.model), 1)
  const contextAwareness = clampToStat(6 + usedRatio * 6 + (windowK >= 200 ? 4 : 2))

  const collabMode = a.mode === "all" ? 5 : a.mode === "primary" ? 3 : 2
  const collabTask = a.permissions.task === "allow" ? 3 : a.permissions.task === "ask" ? 1 : 0
  const collaboration = clampToStat(6 + collabMode * 1.5 + collabTask)

  return { toolAccess, responseAgility, sessionResilience, modelIntelligence, contextAwareness, collaboration }
}

export function computeMetrics(caps: AgentCapabilities): AgentMetrics {
  return {
    sessionCapacity: 10 + Math.floor((caps.sessionResilience - 10) / 2) * 3,
    securityRating: 10 + Math.max(0, Math.floor((caps.toolAccess - 10) / 2)),
    responsiveness: Math.floor((caps.responseAgility - 10) / 2),
    proficiency: 1 + Math.floor((caps.modelIntelligence - 8) / 3),
  }
}

export function getHighestCapability(caps: AgentCapabilities): keyof AgentCapabilities {
  return CAPABILITY_KEYS.reduce((a, b) => caps[a] >= caps[b] ? a : b)
}

export function generateId(): string {
  return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}
