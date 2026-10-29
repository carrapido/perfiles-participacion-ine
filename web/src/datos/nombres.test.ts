import { describe, expect, it } from 'vitest'
import { buscadorDeNombres } from './nombres.ts'

const nombres = buscadorDeNombres({
  entidades: [{ clave: 1, nombre: 'Aguascalientes' }],
  municipios: [{ entidad: 1, municipio: 1, nombre: 'Aguascalientes', brecha: [], perfil_principal: null }],
})

describe('buscadorDeNombres', () => {
  it('encuentra el nombre de una entidad por su clave', () => {
    expect(nombres.deEntidad(1)).toBe('Aguascalientes')
  })

  it('encuentra el nombre de un municipio por su entidad y su clave', () => {
    expect(nombres.deMunicipio(1, 1)).toBe('Aguascalientes')
  })
})
