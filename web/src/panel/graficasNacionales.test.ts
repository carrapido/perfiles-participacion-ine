import { describe, expect, it } from 'vitest'
import { COLOR_CONTEXTO, COLOR_HOMBRES, COLOR_JUDICIAL, COLOR_MUJERES } from '../compartido/colores.ts'
import {
  opcionDeBrechaPorEdad,
  opcionDeParticipacionPorSexo,
  opcionDeValidacionJudicial,
  tablaDeBrechaPorEdad,
  tablaDeParticipacionPorSexo,
  tablaDeValidacionJudicial,
} from './graficasNacionales.ts'

const NACIONAL = [
  { anio: 2021, tipo: 'federal', mujeres: 55.62, hombres: 47.76, brecha: 7.86 },
  { anio: 2024, tipo: 'federal', mujeres: 64.2033, hombres: 54.7598, brecha: 9.4436 },
  { anio: 2025, tipo: 'judicial', mujeres: 13.69, hombres: 12.27, brecha: 1.42 },
] as const

const BRECHA_POR_EDAD = {
  grupos: ['18', '19', '20-24'],
  curvas: { federal_2024: [5.1, 6.24, 7.0], judicial_2025: [1.2, 1.5, null] },
}

const PERFILES = [
  { nombre: 'Hombres en rezago persistente', color: '#2A78D6', trayectoria: [{ anio: 2024, participacion: 48.21 }], judicial_2025: 8.84 },
  { nombre: 'Mujeres de voto constante', color: '#D6517E', trayectoria: [{ anio: 2024, participacion: 65.4 }], judicial_2025: 14.02 },
]

describe('participación por sexo', () => {
  it('muestra solo las elecciones federales, en orden', () => {
    expect(opcionDeParticipacionPorSexo([...NACIONAL]).xAxis).toMatchObject({ data: ['2021', '2024'] })
  })

  it('trae una serie por sexo, con sus valores exactos y sus colores', () => {
    expect(opcionDeParticipacionPorSexo([...NACIONAL]).series).toMatchObject([
      { name: 'Mujeres', data: [55.62, 64.2033], color: COLOR_MUJERES },
      { name: 'Hombres', data: [47.76, 54.7598], color: COLOR_HOMBRES },
    ])
  })

  it('su tabla redondea las tasas nacionales a dos decimales', () => {
    expect(tablaDeParticipacionPorSexo([...NACIONAL]).filas[1]).toEqual(['2024', '64.20%', '54.76%', '+9.44 puntos'])
  })
})

describe('brecha por edad', () => {
  it('resalta la judicial y deja la federal 2024 como contexto', () => {
    const opcion = opcionDeBrechaPorEdad(BRECHA_POR_EDAD.grupos, BRECHA_POR_EDAD.curvas)
    expect(opcion.xAxis).toMatchObject({ data: ['18', '19', '20-24'] })
    expect(opcion.series).toMatchObject([
      { name: 'Federal 2024', data: [5.1, 6.24, 7.0], color: COLOR_CONTEXTO },
      { name: 'Judicial 2025', data: [1.2, 1.5, null], color: COLOR_JUDICIAL },
    ])
  })

  it('su tabla redondea a un decimal y marca los grupos sin dato', () => {
    expect(tablaDeBrechaPorEdad(BRECHA_POR_EDAD.grupos, BRECHA_POR_EDAD.curvas).filas[2]).toEqual(['20-24', '+7.0 puntos', 'sin datos'])
  })
})

describe('validación judicial', () => {
  it('une la federal 2024 y la judicial 2025 de cada perfil con su color', () => {
    const opcion = opcionDeValidacionJudicial(PERFILES)
    expect(opcion.xAxis).toMatchObject({ data: ['Federal 2024', 'Judicial 2025'] })
    expect(opcion.series).toMatchObject([
      { name: 'Hombres en rezago persistente', data: [48.21, 8.84], color: '#2A78D6' },
      { name: 'Mujeres de voto constante', data: [65.4, 14.02], color: '#D6517E' },
    ])
  })

  it('su tabla redondea a un decimal, como el documento', () => {
    expect(tablaDeValidacionJudicial(PERFILES).filas[0]).toEqual(['Hombres en rezago persistente', '48.2%', '8.8%'])
  })
})
