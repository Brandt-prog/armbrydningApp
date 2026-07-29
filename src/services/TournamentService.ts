import type { Tournament } from '../models/Tournament'
import { SupermatchRepository } from '../repositories/SupermatchRepository'
import { TournamentRepository } from '../repositories/TournamentRepository'
import { UserRepository } from '../repositories/UserRepository'
import { STARTING_RATING } from './EloMath'
import { calculateTournamentRatingChanges } from './TournamentEloService'

export class TournamentServiceError extends Error {}

interface PlacementInput {
  userId: string
  placement: number
}

async function countEventsPlayed(userId: string): Promise<number> {
  const [tournamentResults, supermatches] = await Promise.all([
    TournamentRepository.getResultsByUserId(userId),
    SupermatchRepository.getByPlayerId(userId),
  ])
  return tournamentResults.length + supermatches.length
}

export async function recordTournament(
  name: string,
  date: string,
  organizingClubId: string | null,
  recordedBy: string,
  placements: PlacementInput[]
): Promise<Tournament> {
  if (placements.length < 2) {
    throw new TournamentServiceError('A tournament needs at least 2 participants.')
  }

  const uniquePlacements = new Set(placements.map((p) => p.placement))
  if (uniquePlacements.size !== placements.length) {
    throw new TournamentServiceError('Each participant must have a unique placement.')
  }

  const tournament = await TournamentRepository.create({
    name,
    date,
    organizingClubId,
    recordedBy,
  })

  const participants = await Promise.all(
    placements.map(async (p) => {
      const user = await UserRepository.getById(p.userId)
      if (!user) {
        throw new TournamentServiceError(`User ${p.userId} not found.`)
      }
      const eventsPlayed = await countEventsPlayed(p.userId)
      return {
        userId: p.userId,
        rating: user.rating ?? STARTING_RATING,
        tournamentsPlayed: eventsPlayed,
        placement: p.placement,
      }
    })
  )

  const changes = calculateTournamentRatingChanges(participants)

  await Promise.all(
    changes.map(async (change) => {
      const placement = placements.find((p) => p.userId === change.userId)!.placement
      await TournamentRepository.createResult({
        tournamentId: tournament.id,
        userId: change.userId,
        placement,
        ratingBefore: change.ratingBefore,
        ratingAfter: change.ratingAfter,
      })
      await UserRepository.update(change.userId, { rating: change.ratingAfter })
    })
  )

  return tournament
}