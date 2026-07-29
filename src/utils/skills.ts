export interface SkillInfo {
  name: string
  description: string
  path: string
}

const SKILL_MAP: Record<string, SkillInfo> = {
  "ui-ux-pro-max": {
    name: "ui-ux-pro-max",
    description: "UI/UX design intelligence — 67 styles, 161 color palettes, 57 font pairings, 99 UX guidelines, 25 chart types, 22 tech stacks. Full searchable database with BM25 reasoning engine.",
    path: "~/.opencode/skills/ui-ux-pro-max/SKILL.md",
  },
  "design-system": {
    name: "design-system",
    description: "Design system tokens — component specs, primitive/semantic tokens, Tailwind integration, slide generation",
    path: "~/.opencode/skills/design-system/SKILL.md",
  },
  "behavioural-psychology": {
    name: "behavioural-psychology",
    description: "Behavioural psychology — cognitive biases, motivation models, ethical design patterns",
    path: "~/.opencode/skills/behavioural-psychology/SKILL.md",
  },
  "code-review": {
    name: "code-review",
    description: "Code review — vulnerability taxonomy (P0-P4), anti-patterns, security headers checklist",
    path: "~/.opencode/skills/code-review/SKILL.md",
  },
}

export function getAvailableSkills(): SkillInfo[] {
  return Object.values(SKILL_MAP)
}

export function getSkillInfo(name: string): SkillInfo | undefined {
  return SKILL_MAP[name]
}

export function getSkillNames(): string[] {
  return Object.keys(SKILL_MAP)
}
