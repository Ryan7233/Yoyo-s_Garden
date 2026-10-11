export type SkyPhase = 'morning' | 'afternoon' | 'evening' | 'night'

export function skyPhase(hour: number): SkyPhase {
  if (hour >= 6 && hour < 11) return 'morning'
  if (hour >= 11 && hour < 16) return 'afternoon'
  if (hour >= 16 && hour < 19) return 'evening'
  return 'night'
}

export const SKY: Record<SkyPhase, string> = {
  morning: 'linear-gradient(#bfe6ff, #e8f6ff)',
  afternoon: 'linear-gradient(#ffe7a8, #fff6d9)',
  evening: 'linear-gradient(#ffb3a7, #ffd9c2)',
  night: 'linear-gradient(#3b3170, #6b5aa8)',
}
