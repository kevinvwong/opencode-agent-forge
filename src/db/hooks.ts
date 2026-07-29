import { useEffect, useState, useCallback, useRef } from "react"
import { db } from "./schema.ts"
import type { Agent } from "../types/agent.ts"
import { generateId } from "../types/agent.ts"

export function useAgents() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const mountedRef = useRef(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const all = await db.agents.orderBy("updatedAt").reverse().toArray()
      if (mountedRef.current) setAgents(all)
    } catch (err) {
      if (mountedRef.current) setError(err instanceof Error ? err.message : "Failed to load agents")
    }
    if (mountedRef.current) setLoading(false)
  }, [])

  useEffect(() => {
    mountedRef.current = true
    refresh()
    return () => { mountedRef.current = false }
  }, [refresh])

  return { agents, loading, error, refresh }
}

export function useAgent(id: string | undefined) {
  const [agent, setAgent] = useState<Agent | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    if (!id) { setLoading(false); return }
    setLoading(true)
    setError(null)
    db.agents.get(id)
      .then((a) => {
        if (!cancelled) { setAgent(a ?? null); setLoading(false) }
      })
      .catch((err) => {
        if (!cancelled) { setError(err instanceof Error ? err.message : "Failed to load agent"); setLoading(false) }
      })
    return () => { cancelled = true }
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
    id: generateId(),
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
