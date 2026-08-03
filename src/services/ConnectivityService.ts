import type { Arm } from '../models/Arm'
import { SupermatchRepository } from '../repositories/SupermatchRepository'
import { TournamentMatchRepository } from '../repositories/TournamentMatchRepository'

/**
 * Checks whether two athletes are connected through a chain of common
 * opponents (within a given arm) — i.e. whether there is any path between
 * them in the "who has played whom" graph. If not, their ratings sit on
 * the same numeric scale, but are not meaningfully comparable.
 */
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

async function buildAdjacency(arm: Arm): Promise<Map<string, Set<string>>> {
  const [allTournamentMatches, allSupermatches] = await Promise.all([
    TournamentMatchRepository.getAllByArm(arm),
    SupermatchRepository.getAllByArm(arm),
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

  return adjacency
}