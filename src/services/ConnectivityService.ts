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

function componentsFromAdjacency(adjacency: Map<string, Set<string>>): Set<string>[] {
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

/**
 * Combined fetch: builds the match-graph ONCE, and derives both the
 * connected components AND each user's distinct-opponent count from that
 * single adjacency map — avoiding fetching the same match data twice.
 */
export async function getLeaderboardGraphData(arm: Arm): Promise<{
  components: Set<string>[]
  opponentCounts: Map<string, number>
}> {
  const adjacency = await buildAdjacency(arm)
  const components = componentsFromAdjacency(adjacency)

  const opponentCounts = new Map<string, number>()
  for (const [userId, neighbors] of adjacency.entries()) {
    opponentCounts.set(userId, neighbors.size)
  }

  return { components, opponentCounts }
}

export async function getConnectedComponents(arm: Arm): Promise<Set<string>[]> {
  const adjacency = await buildAdjacency(arm)
  return componentsFromAdjacency(adjacency)
}