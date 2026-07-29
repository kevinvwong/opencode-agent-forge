export interface SkillInfo {
  name: string
  description: string
  path: string
  source: string
}

const SKILL_MAP: Record<string, SkillInfo> = {
  "ui-ux-pro-max": {
    name: "ui-ux-pro-max",
    description: "UI/UX design intelligence — 67 styles, 161 color palettes, 57 font pairings, 99 UX guidelines, 25 chart types, 22 tech stacks",
    path: "~/.opencode/skills/ui-ux-pro-max/SKILL.md",
    source: "nextlevelbuilder/ui-ux-pro-max-skill (111k stars)",
  },
  "design-system": {
    name: "design-system",
    description: "Design tokens — primitive/semantic/component tokens, CSS variables, spacing/typography scales, component specs",
    path: "~/.opencode/skills/design-system/SKILL.md",
    source: "nextlevelbuilder/ui-ux-pro-max-skill",
  },
  "brand": {
    name: "brand",
    description: "Brand identity — voice, visual identity, messaging frameworks, asset management, style guides",
    path: "~/.opencode/skills/brand/SKILL.md",
    source: "nextlevelbuilder/ui-ux-pro-max-skill",
  },
  "banner-design": {
    name: "banner-design",
    description: "Banner design — social media, ads, website heroes, print. 22 styles across 10 platforms",
    path: "~/.opencode/skills/banner-design/SKILL.md",
    source: "nextlevelbuilder/ui-ux-pro-max-skill",
  },
  "design": {
    name: "design",
    description: "Comprehensive design — brand identity, logo generation (55 styles), CIP, mockups, slides, icons, social photos",
    path: "~/.opencode/skills/design/SKILL.md",
    source: "nextlevelbuilder/ui-ux-pro-max-skill",
  },
  "slides": {
    name: "slides",
    description: "HTML presentations — Chart.js, design tokens, responsive layouts, copywriting formulas, slide strategies",
    path: "~/.opencode/skills/slides/SKILL.md",
    source: "nextlevelbuilder/ui-ux-pro-max-skill",
  },
  "ui-styling": {
    name: "ui-styling",
    description: "UI styling — shadcn/ui, Radix UI, Tailwind CSS, accessible components, dark mode, responsive layouts",
    path: "~/.opencode/skills/ui-styling/SKILL.md",
    source: "nextlevelbuilder/ui-ux-pro-max-skill",
  },
  "behavioural-psychology": {
    name: "behavioural-psychology",
    description: "Behavioural psychology — 20 cognitive biases, 5 motivation models, cognitive load types, 6 ethical principles, 8 dark patterns",
    path: "~/.opencode/skills/behavioural-psychology/SKILL.md",
    source: "custom-built",
  },
  "code-review": {
    name: "code-review",
    description: "Code review — P0-P4 vulnerability taxonomy, language anti-patterns, security headers checklist",
    path: "~/.opencode/skills/code-review/SKILL.md",
    source: "custom-built",
  },
  "skill-security-auditor": {
    name: "skill-security-auditor",
    description: "Security audit scanner — scans skills for malicious code, command injection, data exfiltration, prompt injection before installation",
    path: "~/.config/opencode/skills/skill-security-auditor/SKILL.md",
    source: "alirezarezvani/claude-skills (21k stars)",
  },
  "threat-modeler": {
    name: "threat-modeler",
    description: "Threat modeling — STRIDE categorization, attack trees, CWE/OWASP mapping, multi-agent vulnerability analysis, execution monitoring",
    path: "~/.config/opencode/skills/threat-modeler/SKILL.md",
    source: "custom-built (PentAGI-inspired)",
  },
  "api-design-reviewer": {
    name: "api-design-reviewer",
    description: "API design review — REST API linter, breaking change detector, design scorecard",
    path: "~/.config/opencode/skills/api-design-reviewer/SKILL.md",
    source: "alirezarezvani/claude-skills (21k stars)",
  },
  "database-designer": {
    name: "database-designer",
    description: "Database schema design — schema analyzer, ERD generation, index optimizer, migration generator",
    path: "~/.config/opencode/skills/database-designer/SKILL.md",
    source: "alirezarezvani/claude-skills (21k stars)",
  },
  "migration-architect": {
    name: "migration-architect",
    description: "Migration planning — migration planner, compatibility checker, rollback generator",
    path: "~/.config/opencode/skills/migration-architect/SKILL.md",
    source: "alirezarezvani/claude-skills (21k stars)",
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

export function getSkillsForLane(lane: string): SkillInfo[] {
  const laneMap: Record<string, string[]> = {
    "ux-review": ["ui-ux-pro-max", "design-system", "ui-styling"],
    "design": ["ui-ux-pro-max", "design-system", "brand", "ui-styling", "design", "banner-design", "slides"],
    "psychology": ["behavioural-psychology"],
    "review": ["code-review", "skill-security-auditor", "threat-modeler"],
    "security": ["code-review", "skill-security-auditor", "threat-modeler"],
    "docs": [],
    "debug": [],
    "test": [],
    "arch": ["api-design-reviewer", "database-designer", "migration-architect"],
    "research": [],
    "general": [],
  }
  const names = laneMap[lane] ?? []
  return names.map((n) => SKILL_MAP[n]).filter((s): s is SkillInfo => s !== undefined)
}
