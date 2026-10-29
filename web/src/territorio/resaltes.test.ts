import { describe, expect, it } from 'vitest'
import { NACIONAL } from './nivelDeZoom.ts'
import { resaltesDe } from './resaltes.ts'

const JALISCO = 14
const GEOMETRIA = {
  municipios: [
    { entidad: JALISCO, municipio: 39, trazo: 'M1,1Z' },
    { entidad: 15, municipio: 39, trazo: 'M2,2Z' },
  ],
  trazoDeEntidad: new Map([[JALISCO, 'M0,0Z']]),
}

describe('resaltesDe', () => {
  it('en la vista nacional no resalta nada', () => {
    expect(resaltesDe(NACIONAL, GEOMETRIA)).toEqual({ entidad: null, municipio: null })
  })

  it('en una entidad resalta su contorno', () => {
    expect(resaltesDe({ nivel: 'entidad', entidad: JALISCO }, GEOMETRIA)).toEqual({ entidad: 'M0,0Z', municipio: null })
  })

  it('en un municipio resalta su entidad y el municipio, aunque su clave se repita en otra entidad', () => {
    expect(resaltesDe({ nivel: 'municipio', entidad: JALISCO, municipio: 39 }, GEOMETRIA))
      .toEqual({ entidad: 'M0,0Z', municipio: 'M1,1Z' })
  })
})
