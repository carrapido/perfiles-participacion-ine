import { interpolatePuOr } from 'd3'
import { describe, expect, it } from 'vitest'
import { COLOR_SIN_DATOS, colorDeBrecha } from './colorDeBrecha.ts'

const MORADO = interpolatePuOr(0)
const NEUTRO = interpolatePuOr(0.5)
const NARANJA_CAFE = interpolatePuOr(1)

describe('colorDeBrecha', () => {
  it('pinta de morado cuando las mujeres votan 20 puntos más', () => {
    expect(colorDeBrecha(20)).toBe(MORADO)
  })

  it('pinta de naranja café cuando los hombres votan 20 puntos más', () => {
    expect(colorDeBrecha(-20)).toBe(NARANJA_CAFE)
  })

  it('pinta el tono neutro cuando no hay brecha', () => {
    expect(colorDeBrecha(0)).toBe(NEUTRO)
  })

  it('satura más allá de ±20 puntos', () => {
    expect(colorDeBrecha(28.2)).toBe(MORADO)
    expect(colorDeBrecha(-35)).toBe(NARANJA_CAFE)
  })

  it('usa el color de sin datos cuando el municipio no tuvo votos', () => {
    expect(colorDeBrecha(null)).toBe(COLOR_SIN_DATOS)
  })
})
