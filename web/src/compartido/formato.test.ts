import { describe, expect, it } from 'vitest'
import { formatearBrecha } from './formato.ts'

describe('formatearBrecha', () => {
  it('redondea a un decimal y muestra el signo', () => {
    expect(formatearBrecha(9.4357)).toBe('+9.4 puntos')
    expect(formatearBrecha(-3.21)).toBe('-3.2 puntos')
  })

  it('no pone signo cuando la brecha redondeada es cero', () => {
    expect(formatearBrecha(-0.04)).toBe('0.0 puntos')
  })

  it('dice sin datos cuando no hay brecha', () => {
    expect(formatearBrecha(null)).toBe('sin datos')
  })
})
