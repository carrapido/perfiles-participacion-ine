import { describe, expect, it } from 'vitest'
import { NACIONAL } from './nivelDeZoom.ts'
import { pasosDeLaRuta } from './ruta.ts'

const JALISCO = 14
const nombreDeEntidad = (entidad: number) => (entidad === JALISCO ? 'Jalisco' : 'Otra')
const nombreDeMunicipio = (_entidad: number, municipio: number) => (municipio === 39 ? 'Guadalajara' : 'Otro')

describe('pasosDeLaRuta', () => {
  it('en la vista nacional solo muestra México', () => {
    expect(pasosDeLaRuta(NACIONAL, nombreDeEntidad, nombreDeMunicipio)).toEqual([{ etiqueta: 'México', destino: NACIONAL }])
  })

  it('en una entidad muestra México y la entidad', () => {
    const entidad = { nivel: 'entidad', entidad: JALISCO } as const
    expect(pasosDeLaRuta(entidad, nombreDeEntidad, nombreDeMunicipio)).toEqual([
      { etiqueta: 'México', destino: NACIONAL },
      { etiqueta: 'Jalisco', destino: entidad },
    ])
  })

  it('en un municipio muestra México, su entidad y el municipio; la entidad lleva de regreso a ella', () => {
    const municipio = { nivel: 'municipio', entidad: JALISCO, municipio: 39 } as const
    expect(pasosDeLaRuta(municipio, nombreDeEntidad, nombreDeMunicipio)).toEqual([
      { etiqueta: 'México', destino: NACIONAL },
      { etiqueta: 'Jalisco', destino: { nivel: 'entidad', entidad: JALISCO } },
      { etiqueta: 'Guadalajara', destino: municipio },
    ])
  })
})
