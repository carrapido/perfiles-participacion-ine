import { describe, expect, it } from 'vitest'
import { figurasDel } from './figuras.ts'

const CAMPECHE = 4 // la única entidad sin judicial

const DATOS = {
  elecciones: [2024, 2025],
  nacional: [
    { anio: 2024, tipo: 'federal', mujeres: 64.2, hombres: 54.76, brecha: 9.44 },
    { anio: 2025, tipo: 'judicial', mujeres: 13.69, hombres: 12.27, brecha: 1.42 },
  ],
  perfiles: [
    {
      id: 'mujeres_0',
      orden: 1,
      nombre: 'Mujeres de voto constante',
      sexo: 'mujeres',
      color: '#D6517E',
      trayectoria: [{ anio: 2024, participacion: 65.4 }],
      judicial_2025: 14.02,
    },
  ],
  brechaPorEdad: {
    grupos_de_edad: ['18', '19'],
    ambitos: [
      { clave: 0, nombre: 'Nacional', federal_2024: [7.2, 8.66], judicial_2025: [1.1, 1.3] },
      { clave: CAMPECHE, nombre: 'Campeche', federal_2024: [6.1, 7.4], judicial_2025: null },
    ],
  },
  entidades: [
    {
      clave: CAMPECHE,
      nombre: 'Campeche',
      participacion: [{ anio: 2024, tipo: 'federal', mujeres: 66.1, hombres: 57.3, brecha: 8.8 }],
      reparto: { mujeres_0: 100 },
      perfil_principal: { mujeres: 'mujeres_0', hombres: null },
    },
  ],
  municipios: [{ entidad: CAMPECHE, municipio: 2, nombre: 'Campeche', brecha: [7.5, null], perfil_principal: null }],
} as const

const titulos = (figuras: { titulo: string }[]) => figuras.map(({ titulo }) => titulo)

describe('figuras del panel según el nivel de zoom', () => {
  it('en México: participación por sexo, brecha por edad y validación judicial', () => {
    expect(titulos(figurasDel({ nivel: 'nacional' }, DATOS))).toEqual([
      'Participación por sexo en las elecciones federales',
      'Brecha por edad, en puntos',
      'Participación de cada perfil: federal 2024 y judicial 2025',
    ])
  })

  it('en una entidad: su participación por sexo, su reparto de perfiles y su brecha por edad', () => {
    const figuras = figurasDel({ nivel: 'entidad', entidad: CAMPECHE }, DATOS)
    expect(titulos(figuras)).toEqual([
      'Participación por sexo en las elecciones federales',
      'Reparto de la lista nominal 2024 por perfil',
      'Brecha por edad, en puntos',
    ])
    expect(figuras[0]?.opcion.series).toMatchObject([{ data: [66.1] }, { data: [57.3] }])
    expect(figuras[2]?.opcion.series).toMatchObject([{ data: [6.1, 7.4] }, { data: [] }])
  })

  it('en un municipio: su brecha por elección junto a la de su entidad, que puede no tener judicial', () => {
    const figuras = figurasDel({ nivel: 'municipio', entidad: CAMPECHE, municipio: 2 }, DATOS)
    expect(titulos(figuras)).toEqual(['Brecha mujeres − hombres por elección, en puntos'])
    expect(figuras[0]?.opcion.xAxis).toMatchObject({ data: ['2024', 'Judicial 2025'] })
    expect(figuras[0]?.opcion.series).toMatchObject([
      { name: 'Municipio', data: [{ value: 7.5 }, null] },
      { name: 'Entidad', data: [{ value: 8.8 }, null] },
    ])
  })

  it('no inventa figuras para una clave que no está en los datos', () => {
    expect(figurasDel({ nivel: 'entidad', entidad: 99 }, DATOS)).toEqual([])
    expect(figurasDel({ nivel: 'municipio', entidad: CAMPECHE, municipio: 99 }, DATOS)).toEqual([])
  })
})
