import { describe, expect, it } from 'vitest'
import { nombreDeEleccion, opcionesDeEleccion } from './elecciones.ts'

const NACIONAL = [
  { anio: 2021, tipo: 'federal', mujeres: 55.6, hombres: 47.8, brecha: 7.9 },
  { anio: 2024, tipo: 'federal', mujeres: 64.2, hombres: 54.8, brecha: 9.4 },
  { anio: 2025, tipo: 'judicial', mujeres: 13.7, hombres: 12.3, brecha: 1.4 },
] as const

describe('opcionesDeEleccion', () => {
  it('ofrece cada elección en orden; las federales con su año y la judicial con su tipo', () => {
    expect(opcionesDeEleccion([...NACIONAL])).toEqual([
      { valor: 2021, etiqueta: '2021' },
      { valor: 2024, etiqueta: '2024' },
      { valor: 2025, etiqueta: 'Judicial 2025' },
    ])
  })
})

describe('nombreDeEleccion', () => {
  it('nombra la elección con su tipo y su año', () => {
    expect(nombreDeEleccion([...NACIONAL], 2024)).toBe('elección federal 2024')
    expect(nombreDeEleccion([...NACIONAL], 2025)).toBe('elección judicial 2025')
  })
})
