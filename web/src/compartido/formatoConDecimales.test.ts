import { describe, expect, it } from 'vitest'
import { formatearBrecha, formatearPorcentaje } from './formato.ts'

describe('formatearPorcentaje', () => {
  it('redondea a un decimal por omisión', () => {
    expect(formatearPorcentaje(48.2346)).toBe('48.2%')
  })

  it('usa dos decimales en las tasas nacionales, como el documento técnico', () => {
    expect(formatearPorcentaje(64.20333820466922, 2)).toBe('64.20%')
  })
})

describe('formatearBrecha con dos decimales', () => {
  it('redondea la brecha nacional a dos decimales con signo', () => {
    expect(formatearBrecha(9.443570660031114, 2)).toBe('+9.44 puntos')
  })
})
