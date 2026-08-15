import type { GlickoRating } from './GlickoMath'
import { DEFAULT_RATING, DEFAULT_RD, DEFAULT_VOLATILITY, updateGlickoAfterGame, winProbability } from './GlickoMath'

function newPlayer(): GlickoRating {
  return { rating: DEFAULT_RATING, rd: DEFAULT_RD, volatility: DEFAULT_VOLATILITY }
}

describe('GlickoMath', () => {
  describe('updateGlickoAfterGame', () => {
    it('increases rating for a win', () => {
      const player = newPlayer()
      const opponent = newPlayer()
      const result = updateGlickoAfterGame(player, opponent, 1)
      expect(result.rating).toBeGreaterThan(player.rating)
    })

    it('decreases rating for a loss', () => {
      const player = newPlayer()
      const opponent = newPlayer()
      const result = updateGlickoAfterGame(player, opponent, 0)
      expect(result.rating).toBeLessThan(player.rating)
    })

    it('decreases RD (increases certainty) after any game', () => {
      const player = newPlayer()
      const opponent = newPlayer()
      const result = updateGlickoAfterGame(player, opponent, 1)
      expect(result.rd).toBeLessThan(player.rd)
    })

    it('never lets RD drop below the minimum floor of 30', () => {
      let player = newPlayer()
      const opponent: GlickoRating = { rating: 1500, rd: 50, volatility: 0.06 }
      // Simulate many games to drive RD down as far as possible
      for (let i = 0; i < 50; i++) {
        player = updateGlickoAfterGame(player, opponent, i % 2 === 0 ? 1 : 0)
      }
      expect(player.rd).toBeGreaterThanOrEqual(30)
    })

    it('gives a bigger rating boost for an upset win than an expected win', () => {
      const underdog: GlickoRating = { rating: 1400, rd: 80, volatility: 0.06 }
      const favorite: GlickoRating = { rating: 1700, rd: 80, volatility: 0.06 }

      const upsetResult = updateGlickoAfterGame(underdog, favorite, 1) // underdog wins (unexpected)
      const expectedResult = updateGlickoAfterGame(favorite, underdog, 1) // favorite wins (expected)

      const upsetGain = upsetResult.rating - underdog.rating
      const expectedGain = expectedResult.rating - favorite.rating

      expect(upsetGain).toBeGreaterThan(expectedGain)
    })

    it('gives smaller rating changes to established (low-RD) players than to new (high-RD) players', () => {
      const established: GlickoRating = { rating: 1500, rd: 60, volatility: 0.06 }
      const brandNew: GlickoRating = { rating: 1500, rd: 350, volatility: 0.06 }
      const opponent: GlickoRating = { rating: 1500, rd: 100, volatility: 0.06 }

      const establishedResult = updateGlickoAfterGame(established, opponent, 1)
      const newResult = updateGlickoAfterGame(brandNew, opponent, 1)

      const establishedChange = Math.abs(establishedResult.rating - established.rating)
      const newChange = Math.abs(newResult.rating - brandNew.rating)

      expect(establishedChange).toBeLessThan(newChange)
    })
  })

  describe('winProbability', () => {
    it('gives 50% probability for two identical, equally-rated players', () => {
      const a = newPlayer()
      const b = newPlayer()
      const prob = winProbability(a, b)
      expect(prob).toBeCloseTo(0.5, 2)
    })

    it('favors the higher-rated player', () => {
      const strong: GlickoRating = { rating: 1700, rd: 80, volatility: 0.06 }
      const weak: GlickoRating = { rating: 1300, rd: 80, volatility: 0.06 }
      expect(winProbability(strong, weak)).toBeGreaterThan(0.5)
      expect(winProbability(weak, strong)).toBeLessThan(0.5)
    })

    it('returns a probability strictly between 0 and 1', () => {
      const a: GlickoRating = { rating: 2000, rd: 30, volatility: 0.06 }
      const b: GlickoRating = { rating: 1000, rd: 30, volatility: 0.06 }
      const prob = winProbability(a, b)
      expect(prob).toBeGreaterThan(0)
      expect(prob).toBeLessThan(1)
    })
  })
})