import { describe, expect, it } from 'vitest'
import { NACIONAL, alHacerClicEnMunicipio } from './nivelDeZoom.ts'

const JALISCO = 14
const ESTADO_DE_MEXICO = 15

describe('alHacerClicEnMunicipio', () => {
  it('desde la vista nacional enfoca la entidad del municipio', () => {
    expect(alHacerClicEnMunicipio(NACIONAL, JALISCO, 1)).toEqual({ nivel: 'entidad', entidad: JALISCO })
  })

  it('dentro de la entidad enfocada selecciona el municipio', () => {
    expect(alHacerClicEnMunicipio({ nivel: 'entidad', entidad: JALISCO }, JALISCO, 39))
      .toEqual({ nivel: 'municipio', entidad: JALISCO, municipio: 39 })
  })

  it('con un municipio seleccionado cambia a otro de la misma entidad', () => {
    expect(alHacerClicEnMunicipio({ nivel: 'municipio', entidad: JALISCO, municipio: 39 }, JALISCO, 2))
      .toEqual({ nivel: 'municipio', entidad: JALISCO, municipio: 2 })
  })

  it('en un municipio de otra entidad enfoca esa otra entidad', () => {
    expect(alHacerClicEnMunicipio({ nivel: 'municipio', entidad: JALISCO, municipio: 39 }, ESTADO_DE_MEXICO, 3))
      .toEqual({ nivel: 'entidad', entidad: ESTADO_DE_MEXICO })
  })
})
