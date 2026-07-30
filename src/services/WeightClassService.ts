import type { Gender } from '../models/Gender'

export type AgeCategory =
  | 'U15' | 'U18' | 'U21' | 'Senior'
  | 'Masters' | 'Grandmaster' | 'SeniorGrandmaster' | 'UltraGrandmaster'

interface WeightClassTable {
  [ageCategory: string]: {
    male: number[]
    female: number[]
  }
}

// Upper bound (kg) for each class; the last number represents "+X kg" (no upper limit)
const IFA_WEIGHT_CLASSES: WeightClassTable = {
  U15: { male: [48, 52, 57, 63, 70, 78], female: [45, 48, 52, 57, 63] },
  U18: { male: [52, 57, 63, 70, 78, 86], female: [45, 48, 52, 57, 63] },
  U21: { male: [57, 63, 70, 78, 86, 95], female: [52, 57, 63, 70, 78] },
  Senior: { male: [57, 63, 70, 78, 86, 95, 105], female: [52, 57, 63, 70, 78] },
  Masters: { male: [70, 78, 86, 95, 105], female: [63, 78] },
  Grandmaster: { male: [70, 78, 86, 95, 105], female: [63, 78] },
  SeniorGrandmaster: { male: [70, 78, 86, 95, 105], female: [] },
  UltraGrandmaster: { male: [78], female: [] },
}

/**
 * Determines the IFA age category from a birth date, as of a given reference date.
 * NOTE: Masters/Grandmaster/etc. thresholds are reasonable defaults —
 * confirm exact cutoffs with the federation if precision matters later.
 */
export function getAgeCategory(birthDate: string, referenceDate: Date = new Date()): AgeCategory {
  const birth = new Date(birthDate)
  let age = referenceDate.getFullYear() - birth.getFullYear()
  const hasHadBirthdayThisYear =
    referenceDate.getMonth() > birth.getMonth() ||
    (referenceDate.getMonth() === birth.getMonth() && referenceDate.getDate() >= birth.getDate())
  if (!hasHadBirthdayThisYear) age -= 1

  if (age < 15) return 'U15'
  if (age < 18) return 'U18'
  if (age < 21) return 'U21'
  if (age < 40) return 'Senior'
  if (age < 50) return 'Masters'
  if (age < 60) return 'Grandmaster'
  if (age < 70) return 'SeniorGrandmaster'
  return 'UltraGrandmaster'
}

/**
 * Determines the IFA weight class label (e.g. "70kg" or "+105kg").
 */
export function getWeightClass(ageCategory: AgeCategory, gender: Gender, weight: number): string {
  const thresholds = IFA_WEIGHT_CLASSES[ageCategory]?.[gender]
  if (!thresholds || thresholds.length === 0) {
    return 'Open'
  }

  for (const max of thresholds) {
    if (weight <= max) return `${max}kg`
  }
  const heaviest = thresholds[thresholds.length - 1]
  return `+${heaviest}kg`
}

export function classifyAthlete(
  birthDate: string,
  gender: Gender,
  weight: number,
  referenceDate: Date = new Date()
): { ageCategory: AgeCategory; weightClass: string } {
  const ageCategory = getAgeCategory(birthDate, referenceDate)
  const weightClass = getWeightClass(ageCategory, gender, weight)
  return { ageCategory, weightClass }
}