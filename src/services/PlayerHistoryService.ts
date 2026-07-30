import { SupermatchRepository } from '../repositories/SupermatchRepository'
import { TournamentRepository } from '../repositories/TournamentRepository'
import { UserRepository } from '../repositories/UserRepository'

export interface TournamentHistoryEntry {
  tournamentId: string
  tournamentName: string
  date: string
  placement: number
  ratingBefore: number
  ratingAfter: number
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
  const results = await TournamentRepository.getResultsByUserId(userId)

  const entries = await Promise.all(
    results.map(async (result) => {
      const tournament = await TournamentRepository.getById(result.tournamentId)
      return {
        tournamentId: result.tournamentId,
        tournamentName: tournament?.name ?? 'Ukendt turnering',
        date: tournament?.date ?? '',
        placement: result.placement,
        ratingBefore: result.ratingBefore,
        ratingAfter: result.ratingAfter,
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