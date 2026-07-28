export const TOOLTIPS = {
  capabilities: {
    toolAccess: "Tool Access (TAC) — How many tools this agent can use. Driven by permission levels: each 'allow' grants +2, each 'ask' grants +1.",
    responseAgility: "Response Agility (RAG) — How quickly the agent responds. Driven by model speed (Haiku fastest) and temperature setting.",
    sessionResilience: "Session Resilience (SRS) — How many iterations before forced summarization. Driven by the 'steps' config value.",
    modelIntelligence: "Model Intelligence (MIT) — The underlying model's capability tier. GPT-5 > Sonnet > Codex > Haiku.",
    contextAwareness: "Context Awareness (CAW) — How much of the model's context window the prompt utilizes. Based on prompt length relative to model limit.",
    collaboration: "Collaboration (COL) — How well the agent works with others. All mode > Primary > Subagent. Task permission adds bonus.",
  },
  metrics: {
    sessionCapacity: "Session Capacity — Maximum tool call iterations before forced text response. Based on Session Resilience.",
    securityRating: "Security Rating — How restricted the agent's tool access is. Higher = more locked down. Based on Tool Access permissions.",
    responsiveness: "Responsiveness — Speed class modifier. Derived from Response Agility.",
    proficiency: "Proficiency Bonus — General capability bonus. Derived from Model Intelligence.",
  },
  permissions: {
    allow: "Allow — Tool can be used freely without confirmation.",
    ask: "Ask — Tool use requires user confirmation each time.",
    deny: "Deny — Tool is blocked and cannot be used.",
  },
  mode: {
    primary: "Primary — Full agent with all tools enabled. Can be set as the default agent.",
    subagent: "Subagent — Specialized agent invoked by primary agents or @mentioned. Limited scope.",
    all: "All — Works as both a primary agent and a subagent. Maximum flexibility.",
  },
  stats: {
    modifier: "Ability modifier. Applied as a bonus or penalty to derived metrics. Calculated as (score - 10) / 2, rounded down.",
    heatBar: "Capability score from 3-18. Higher is better. Derived automatically from the agent's real configuration.",
    highest: "This agent's strongest capability. The most prominent score across all six dimensions.",
  },
  model: {
    sonnet: "Claude Sonnet 4 — Best balance of speed and capability. Recommended for most agents.",
    haiku: "Claude Haiku 4 — Fastest responses. Best for simple, high-volume tasks like documentation.",
    gpt5: "GPT-5 — Highest capability. Best for complex reasoning, but slower responses.",
    codex: "GPT-5 Codex — Optimized for code generation tasks.",
  },
}
