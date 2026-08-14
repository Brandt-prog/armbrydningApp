import type { Arm } from '../models/Arm'
import { MatchRepository } from '../repositories/MatchRepository'
import { SupermatchRepository } from '../repositories/SupermatchRepository'
import { TournamentMatchRepository } from '../repositories/TournamentMatchRepository'

async function buildAdjacency(arm: Arm): Promise<Map<string, Set<string>>> {
  const [allTournamentMatches, allSupermatches, allClubMatches] = await Promise.all([
    TournamentMatchRepository.getAllByArm(arm),
    SupermatchRepository.getAllByArm(arm),
    MatchRepository.getAllByArm(arm),
  ])

  const adjacency = new Map<string, Set<string>>()

  function addEdge(a: string, b: string) {
    if (!adjacency.has(a)) adjacency.set(a, new Set())
    if (!adjacency.has(b)) adjacency.set(b, new Set())
    adjacency.get(a)!.add(b)
    adjacency.get(b)!.add(a)
  }

  for (const m of allTournamentMatches) addEdge(m.playerAId, m.playerBId)
  for (const s of allSupermatches) addEdge(s.playerAId, s.playerBId)
  for (const m of allClubMatches.filter((m) => m.status === 'confirmed')) addEdge(m.playerAId, m.playerBId)

  return adjacency
}

export async function areUsersConnected(userAId: string, userBId: string, arm: Arm): Promise<boolean> {
  if (userAId === userBId) return true

  const adjacency = await buildAdjacency(arm)

  const visited = new Set<string>([userAId])
  const queue: string[] = [userAId]

  while (queue.length > 0) {
    const current = queue.shift()!
    if (current === userBId) return true
    const neighbors = adjacency.get(current) ?? new Set()
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor)
        queue.push(neighbor)
      }
    }
  }

  return visited.has(userBId)
}

export async function getConnectedComponents(arm: Arm): Promise<Set<string>[]> {
  const adjacency = await buildAdjacency(arm)
  const visited = new Set<string>()
  const components: Set<string>[] = []

  for (const startNode of adjacency.keys()) {
    if (visited.has(startNode)) continue

    const component = new Set<string>()
    const queue: string[] = [startNode]
    visited.add(startNode)

    while (queue.length > 0) {
      const current = queue.shift()!
      component.add(current)
      const neighbors = adjacency.get(current) ?? new Set()
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor)
          queue.push(neighbor)
        }
      }
    }

    components.push(component)
  }

  return components
}

/**
 * Returns, for each user, the number of DISTINCT opponents they have
 * personally played (their degree in the graph) — not just the size of
 * the wider connected component they happen to belong to. This closes a
 * loophole: being transitively connected to a large group via someone
 * else's single bridge match does not, by itself, mean YOU have proven
 * broad connectivity.
 */
export async function getOpponentCounts(arm: Arm): Promise<Map<string, number>> {
  const adjacency = await buildAdjacency(arm)
  const counts = new Map<string, number>()
  for (const [userId, neighbors] of adjacency.entries()) {
    counts.set(userId, neighbors.size)
  }
  return counts
}