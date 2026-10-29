import { describe, expect, it } from 'vitest'
import { NACIONAL, entidadEnfocada } from './nivelDeZoom.ts'

const JALISCO = 14
const UN_MUNICIPIO = 1

describe('entidadEnfocada', () => {
  it('en la vista nacional no hay entidad que encuadrar', () => {
    expect(entidadEnfocada(NACIONAL)).toBeNull()
  })

  it('en el nivel entidad encuadra esa entidad', () => {
    expect(entidadEnfocada({ nivel: 'entidad', entidad: JALISCO })).toBe(JALISCO)
  })

  it('en el nivel municipio mantiene el encuadre de su entidad', () => {
    expect(entidadEnfocada({ nivel: 'municipio', entidad: JALISCO, municipio: UN_MUNICIPIO })).toBe(JALISCO)
  })
})
