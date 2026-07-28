import type { AgentMode, PermissionLevel, AgentPermissions, DnDStats } from "../types/agent.ts"
import { MODE_CLASS_MAP } from "../types/agent.ts"

export interface ClassTheme {
  label: string
  icon: string
  color: string
  gradient: string
  colorSecondary: string
  borderGlow: string
}

export const CLASS_THEMES: Record<string, ClassTheme> = {
  Fighter: {
    label: "Primary",
    icon: "⚔",
    color: "#dc2626",
    gradient: "linear-gradient(135deg, #dc2626 0%, #991b1b 100%)",
    colorSecondary: "#fca5a5",
    borderGlow: "rgba(220,38,38,0.25)",
  },
  Wizard: {
    label: "Subagent",
    icon: "✦",
    color: "#7c3aed",
    gradient: "linear-gradient(135deg, #7c3aed 0%, #4c1d95 100%)",
    colorSecondary: "#c4b5fd",
    borderGlow: "rgba(124,58,237,0.25)",
  },
  Bard: {
    label: "All",
    icon: "♫",
    color: "#d4a843",
    gradient: "linear-gradient(135deg, #d4a843 0%, #92400e 100%)",
    colorSecondary: "#fde68a",
    borderGlow: "rgba(212,168,67,0.25)",
  },
}

export function getClassTheme(mode: AgentMode): ClassTheme {
  const className = MODE_CLASS_MAP[mode]
  return CLASS_THEMES[className]!
}

export function getPermissionLevel(permissions: AgentPermissions, tool: string): PermissionLevel {
  const v = permissions[tool]
  if (v === "allow" || v === "ask" || v === "deny") return v
  return "deny"
}

export function countPermissions(permissions: AgentPermissions): { allow: number; ask: number; deny: number } {
  const tools = ["read", "write", "edit", "apply_patch", "glob", "grep", "list", "bash", "task", "external_directory", "todowrite", "webfetch", "websearch", "lsp", "skill", "question"]
  const counts = { allow: 0, ask: 0, deny: 0 }
  for (const tool of tools) {
    const level = getPermissionLevel(permissions, tool)
    counts[level]++
  }
  return counts
}

export function computeCombatStats(stats: { strength: number; dexterity: number; constitution: number; intelligence: number; wisdom: number; charisma: number }, level: number) {
  const conMod = Math.floor((stats.constitution - 10) / 2)
  const dexMod = Math.floor((stats.dexterity - 10) / 2)
  return {
    hp: Math.max(1, 10 + conMod * level),
    ac: Math.max(10, 10 + dexMod),
    initiative: dexMod,
    proficiency: Math.ceil(1 + level / 4),
  }
}

const STAT_KEYS: (keyof DnDStats)[] = ["strength", "dexterity", "constitution", "intelligence", "wisdom", "charisma"]

export function getHighestStat(stats: DnDStats): keyof DnDStats {
  return STAT_KEYS.reduce((a, b) => stats[a] >= stats[b] ? a : b)
}
