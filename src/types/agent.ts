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
  contextAwareness: "#7c3aed",
  collaboration: "#db2777",
}

export const MODE_LABELS: Record<AgentMode, string> = {
  primary: "Primary",
  subagent: "Subagent",
  all: "All",
}

export const MODE_COLORS: Record<AgentMode, string> = {
  primary: "#dc2626",
  subagent: "#7c3aed",
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

export function generateCapabilities(): AgentCapabilities {
  function roll4d6DropLowest(): number {
    const rolls = Array.from({ length: 4 }, () => Math.floor(Math.random() * 6) + 1)
    rolls.sort((a, b) => a - b)
    return rolls.slice(1).reduce((a, b) => a + b, 0)
  }
  return {
    toolAccess: roll4d6DropLowest(),
    responseAgility: roll4d6DropLowest(),
    sessionResilience: roll4d6DropLowest(),
    modelIntelligence: roll4d6DropLowest(),
    contextAwareness: roll4d6DropLowest(),
    collaboration: roll4d6DropLowest(),
  }
}

export function computeMetrics(caps: AgentCapabilities): AgentMetrics {
  const conMod = capModifier(caps.sessionResilience)
  const dexMod = capModifier(caps.responseAgility)
  return {
    sessionCapacity: Math.max(1, 10 + conMod * 3),
    securityRating: Math.max(10, 10 + dexMod),
    responsiveness: dexMod,
    proficiency: Math.ceil(1 + 3 / 4),
  }
}

export function getHighestCapability(caps: AgentCapabilities): keyof AgentCapabilities {
  return CAPABILITY_KEYS.reduce((a, b) => caps[a] >= caps[b] ? a : b)
}

export function generateId(): string {
  return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}
