import { interpolatePuOr } from 'd3'
import { describe, expect, it } from 'vitest'
import { degradadoDeBrecha } from './leyendaDeBrecha.ts'

describe('degradadoDeBrecha', () => {
  it('va del morado de las mujeres al naranja café de los hombres, pasando por el neutro', () => {
    const degradado = degradadoDeBrecha()
    expect(degradado.startsWith(`linear-gradient(to right, ${interpolatePuOr(0)}`)).toBe(true)
    expect(degradado).toContain(interpolatePuOr(0.5))
    expect(degradado.endsWith(`${interpolatePuOr(1)})`)).toBe(true)
  })
})
