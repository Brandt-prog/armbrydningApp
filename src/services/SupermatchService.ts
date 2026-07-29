import type { Supermatch } from '../models/Supermatch'
import type { GameWinner } from '../models/SupermatchGame'
import { SupermatchRepository } from '../repositories/SupermatchRepository'
import { TournamentRepository } from '../repositories/TournamentRepository'
import { UserRepository } from '../repositories/UserRepository'
import { STARTING_RATING } from './EloMath'
import { calculateSupermatchRatings } from './SupermatchEloService'

export class SupermatchServiceError extends Error {}

async function countEventsPlayed(userId: string): Promise<number> {
  const [tournamentResults, supermatches] = await Promise.all([
    TournamentRepository.getResultsByUserId(userId),
    SupermatchRepository.getByPlayerId(userId),
  ])
  return tournamentResults.length + supermatches.length
}

export async function recordSupermatch(
  playerAId: string,
  playerBId: string,
  date: string,
  format: string,
  organizingClubId: string | null,
  recordedBy: string,
  gameWinners: GameWinner[]
): Promise<Supermatch> {
  if (playerAId === playerBId) {
    throw new SupermatchServiceError('A player cannot compete against themselves.')
  }
  if (gameWinners.length === 0) {
    throw new SupermatchServiceError('A supermatch needs at least one game result.')
  }

  const [playerA, playerB] = await Promise.all([
    UserRepository.getById(playerAId),
    UserRepository.getById(playerBId),
  ])
  if (!playerA || !playerB) {
    throw new SupermatchServiceError('One or both players could not be found.')
  }

  const [eventsA, eventsB] = await Promise.all([
    countEventsPlayed(playerAId),
    countEventsPlayed(playerBId),
  ])

  const result = calculateSupermatchRatings(
    { userId: playerAId, rating: playerA.rating ?? STARTING_RATING, eventsPlayed: eventsA },
    { userId: playerBId, rating: playerB.rating ?? STARTING_RATING, eventsPlayed: eventsB },
    gameWinners
  )

  const supermatch = await SupermatchRepository.create({
    playerAId,
    playerBId,
    date,
    format,
    organizingClubId,
    recordedBy,
    finalRatingA: result.finalRatingA,
    finalRatingB: result.finalRatingB,
  })

  await SupermatchRepository.createGames(
    result.games.map((g) => ({
      supermatchId: supermatch.id,
      gameNumber: g.gameNumber,
      winner: g.winner,
      ratingABefore: g.ratingABefore,
      ratingBBefore: g.ratingBBefore,
      ratingAAfter: g.ratingAAfter,
      ratingBAfter: g.ratingBAfter,
    }))
  )

  await Promise.all([
    UserRepository.update(playerAId, { rating: result.finalRatingA }),
    UserRepository.update(playerBId, { rating: result.finalRatingB }),
  ])

  return supermatch
}