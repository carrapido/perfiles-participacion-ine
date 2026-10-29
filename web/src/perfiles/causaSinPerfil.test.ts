import { describe, expect, it } from 'vitest'
import { porQueNoTienePerfil } from './causaSinPerfil.ts'

describe('porQueNoTienePerfil', () => {
  it('dice que ningún grupo de edad llega a la lista nominal mínima', () => {
    expect(porQueNoTienePerfil({ causa: 'lista_nominal_chica', minima: 100 })).toBe(
      'ningún grupo de edad llega a 100 personas en la lista nominal en todas las elecciones',
    )
  })

  it('dice de qué elecciones los conteos no tienen participación', () => {
    expect(porQueNoTienePerfil({ causa: 'sin_conteo', elecciones: [2015, 2021] })).toBe(
      'los conteos censales no tienen datos de participación de 2015 y 2021',
    )
  })

  it('dice en qué conteos no aparece el municipio', () => {
    expect(porQueNoTienePerfil({ causa: 'fuera_de_los_conteos', elecciones: [2009, 2012, 2015] })).toBe(
      'el municipio no aparece en los conteos censales de 2009, 2012 y 2015',
    )
  })
})
