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

export interface DnDStats {
  strength: number
  dexterity: number
  constitution: number
  intelligence: number
  wisdom: number
  charisma: number
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

  dndStats: DnDStats
  dndClass: string
  dndLevel: number
  dndRace: string
  dndAlignment: string
  dndBackground: string

  createdAt: string
  updatedAt: string
  sessionCount: number
  tokenCount: number
  lastUsed: string | null
  isTemplate: boolean
}

export const STAT_LABELS: Record<keyof DnDStats, string> = {
  strength: "STR",
  dexterity: "DEX",
  constitution: "CON",
  intelligence: "INT",
  wisdom: "WIS",
  charisma: "CHA",
}

export const STAT_FULL: Record<keyof DnDStats, string> = {
  strength: "Strength",
  dexterity: "Dexterity",
  constitution: "Constitution",
  intelligence: "Intelligence",
  wisdom: "Wisdom",
  charisma: "Charisma",
}

export const STAT_COLORS: Record<keyof DnDStats, string> = {
  strength: "#dc2626",
  dexterity: "#ea580c",
  constitution: "#16a34a",
  intelligence: "#2563eb",
  wisdom: "#7c3aed",
  charisma: "#db2777",
}

export const MODE_CLASS_MAP: Record<AgentMode, string> = {
  primary: "Fighter",
  subagent: "Wizard",
  all: "Bard",
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

export function statModifier(score: number): number {
  return Math.floor((score - 10) / 2)
}

export function rollStats(): DnDStats {
  function roll4d6DropLowest(): number {
    const rolls = Array.from({ length: 4 }, () => Math.floor(Math.random() * 6) + 1)
    rolls.sort((a, b) => a - b)
    return rolls.slice(1).reduce((a, b) => a + b, 0)
  }
  return {
    strength: roll4d6DropLowest(),
    dexterity: roll4d6DropLowest(),
    constitution: roll4d6DropLowest(),
    intelligence: roll4d6DropLowest(),
    wisdom: roll4d6DropLowest(),
    charisma: roll4d6DropLowest(),
  }
}

export function generateId(): string {
  return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}
