import { useEffect, useState, useCallback } from "react"
import { db } from "./schema.ts"
import type { Agent } from "../types/agent.ts"

export function useAgents() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const all = await db.agents.orderBy("updatedAt").reverse().toArray()
      setAgents(all)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load agents")
    }
    setLoading(false)
  }, [])

  useEffect(() => { refresh() }, [refresh])

  return { agents, loading, error, refresh }
}

export function useAgent(id: string | undefined) {
  const [agent, setAgent] = useState<Agent | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) { setLoading(false); return }
    setLoading(true)
    setError(null)
    db.agents.get(id)
      .then((a) => {
        setAgent(a ?? null)
        setLoading(false)
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load agent")
        setLoading(false)
      })
  }, [id])

  return { agent, loading, error }
}

export async function saveAgent(agent: Agent): Promise<void> {
  await db.agents.put({ ...agent, updatedAt: new Date().toISOString() })
}

export async function deleteAgent(id: string): Promise<void> {
  await db.agents.delete(id)
}

export async function duplicateAgent(agent: Agent): Promise<Agent> {
  const dup: Agent = {
    ...agent,
    id: crypto.randomUUID(),
    name: `${agent.name} (copy)`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    sessionCount: 0,
    tokenCount: 0,
    lastUsed: null,
  }
  await db.agents.add(dup)
  return dup
}
