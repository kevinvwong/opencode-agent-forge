import Dexie, { type EntityTable } from "dexie"
import type { Agent } from "../types/agent.ts"

export class AgentDB extends Dexie {
  agents!: EntityTable<Agent, "id">

  constructor() {
    super("AgentForge")
    this.version(1).stores({
      agents: "id, name, mode, tags, createdAt, updatedAt, sessionCount, isTemplate, lastUsed",
    })
  }
}

export const db = new AgentDB()
