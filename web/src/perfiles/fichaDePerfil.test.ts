import { describe, expect, it } from 'vitest'
import { COLOR_CONTEXTO } from '../compartido/colores.ts'
import { opcionDeTrayectoria, pesoDelPerfil, tablaDeJudicial, tablaDeTrayectoria } from './fichaDePerfil.ts'

const PERFIL = {
  nombre: 'Hombres en rezago persistente',
  sexo: 'hombres',
  color: '#2A78D6',
  pct_lista_nominal: 14.3565,
  pct_de_su_sexo: 29.9007,
  trayectoria: [
    { anio: 2021, participacion: 45.7574 },
    { anio: 2024, participacion: 48.2499 },
  ],
  judicial_2025: 8.8092,
} as const

const NACIONAL = [
  { anio: 2021, tipo: 'federal', mujeres: 55.62, hombres: 47.76, brecha: 7.86 },
  { anio: 2024, tipo: 'federal', mujeres: 64.2033, hombres: 54.7598, brecha: 9.4436 },
  { anio: 2025, tipo: 'judicial', mujeres: 13.685, hombres: 12.2676, brecha: 1.4175 },
] as const

describe('ficha de perfil', () => {
  it('dice cuánto pesa el perfil en la lista nominal y en su sexo', () => {
    expect(pesoDelPerfil(PERFIL)).toBe('14.4% de la lista nominal 2024 y 29.9% de los hombres')
  })

  it('compara su trayectoria con la de todo su sexo, que queda como contexto', () => {
    const opcion = opcionDeTrayectoria(PERFIL, NACIONAL)
    expect(opcion.xAxis).toMatchObject({ type: 'category', data: ['2021', '2024'] })
    expect(opcion.series).toMatchObject([
      { type: 'line', name: 'Este perfil', data: [45.7574, 48.2499], color: '#2A78D6' },
      { type: 'line', name: 'Todos los hombres', data: [47.76, 54.7598], color: COLOR_CONTEXTO },
    ])
  })

  it('la tabla de su trayectoria redondea a un decimal', () => {
    expect(tablaDeTrayectoria(PERFIL, NACIONAL)).toEqual({
      columnas: ['Elección', 'Este perfil', 'Todos los hombres'],
      filas: [
        ['2021', '45.8%', '47.8%'],
        ['2024', '48.2%', '54.8%'],
      ],
    })
  })

  it('compara la federal 2024 con la judicial 2025, para el perfil y para todo su sexo', () => {
    expect(tablaDeJudicial(PERFIL, NACIONAL)).toEqual({
      columnas: ['Elección', 'Este perfil', 'Todos los hombres'],
      filas: [
        ['Federal 2024', '48.2%', '54.8%'],
        ['Judicial 2025', '8.8%', '12.3%'],
      ],
    })
  })

  it('nombra a todas las mujeres en femenino', () => {
    const mujeres = { ...PERFIL, sexo: 'mujeres' } as const
    expect(tablaDeJudicial(mujeres, NACIONAL).columnas[2]).toBe('Todas las mujeres')
    expect(pesoDelPerfil(mujeres)).toBe('14.4% de la lista nominal 2024 y 29.9% de las mujeres')
  })
})
