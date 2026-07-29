export interface SkillInfo {
  name: string
  description: string
  path: string
}

const SKILL_MAP: Record<string, SkillInfo> = {
  "design-system": {
    name: "design-system",
    description: "Design system intelligence — styles, colors, typography, patterns, accessibility",
    path: ".opencode/skills/design-system/SKILL.md",
  },
  "behavioural-psychology": {
    name: "behavioural-psychology",
    description: "Behavioural psychology — cognitive biases, motivation models, ethical design",
    path: ".opencode/skills/behavioural-psychology/SKILL.md",
  },
  "code-review": {
    name: "code-review",
    description: "Code review — vulnerability taxonomy, anti-patterns, security headers",
    path: ".opencode/skills/code-review/SKILL.md",
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
