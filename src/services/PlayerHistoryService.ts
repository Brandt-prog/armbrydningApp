import { SupermatchRepository } from '../repositories/SupermatchRepository'
import { TournamentMatchRepository } from '../repositories/TournamentMatchRepository'
import { TournamentRepository } from '../repositories/TournamentRepository'
import { UserRepository } from '../repositories/UserRepository'

export interface TournamentMatchEntry {
  opponentId: string
  opponentName: string
  won: boolean
  ratingBefore: number
  ratingAfter: number
}

export interface TournamentHistoryEntry {
  tournamentId: string
  tournamentName: string
  date: string
  matches: TournamentMatchEntry[]
  netChange: number
}

export interface SupermatchHistoryEntry {
  supermatchId: string
  opponentName: string
  date: string
  gamesWon: number
  gamesLost: number
  ratingBefore: number
  ratingAfter: number
}

export async function getTournamentHistory(userId: string): Promise<TournamentHistoryEntry[]> {
  const allMatches = await TournamentMatchRepository.getByPlayerId(userId)

  const byTournament = new Map<string, typeof allMatches>()
  for (const m of allMatches) {
    const arr = byTournament.get(m.tournamentId) ?? []
    arr.push(m)
    byTournament.set(m.tournamentId, arr)
  }

  const entries = await Promise.all(
    Array.from(byTournament.entries()).map(async ([tournamentId, matches]) => {
      const tournament = await TournamentRepository.getById(tournamentId)
      const sorted = [...matches].sort((a, b) => a.sequenceNumber - b.sequenceNumber)

      const matchEntries = await Promise.all(
        sorted.map(async (m) => {
          const isPlayerA = m.playerAId === userId
          const opponentId = isPlayerA ? m.playerBId : m.playerAId
          const opponent = await UserRepository.getById(opponentId)
          return {
            opponentId,
            opponentName: opponent?.name ?? 'Ukendt spiller',
            won: m.winnerId === userId,
            ratingBefore: isPlayerA ? m.ratingABefore : m.ratingBBefore,
            ratingAfter: isPlayerA ? m.ratingAAfter : m.ratingBAfter,
          }
        })
      )

      const netChange =
        matchEntries.length > 0
          ? matchEntries[matchEntries.length - 1].ratingAfter - matchEntries[0].ratingBefore
          : 0

      return {
        tournamentId,
        tournamentName: tournament?.name ?? 'Ukendt turnering',
        date: tournament?.date ?? '',
        matches: matchEntries,
        netChange,
      }
    })
  )

  return entries.sort((a, b) => (a.date < b.date ? 1 : -1))
}

export async function getSupermatchHistory(userId: string): Promise<SupermatchHistoryEntry[]> {
  const supermatches = await SupermatchRepository.getByPlayerId(userId)

  const entries = await Promise.all(
    supermatches.map(async (sm) => {
      const isPlayerA = sm.playerAId === userId
      const opponentId = isPlayerA ? sm.playerBId : sm.playerAId
      const opponent = await UserRepository.getById(opponentId)
      const games = await SupermatchRepository.getGamesBySupermatchId(sm.id)

      const gamesWon = games.filter((g) => (isPlayerA ? g.winner === 'A' : g.winner === 'B')).length
      const gamesLost = games.length - gamesWon

      const ratingBefore = isPlayerA ? games[0]?.ratingABefore : games[0]?.ratingBBefore
      const ratingAfter = isPlayerA ? sm.finalRatingA : sm.finalRatingB

      return {
        supermatchId: sm.id,
        opponentName: opponent?.name ?? 'Ukendt spiller',
        date: sm.date,
        gamesWon,
        gamesLost,
        ratingBefore: ratingBefore ?? ratingAfter,
        ratingAfter,
      }
    })
  )

  return entries.sort((a, b) => (a.date < b.date ? 1 : -1))
}