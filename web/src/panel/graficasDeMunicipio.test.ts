import { describe, expect, it } from 'vitest'
import { COLOR_CONTEXTO, COLOR_MUNICIPIO } from '../compartido/colores.ts'
import { opcionDeBrechaPorEleccion, tablaDeBrechaPorEleccion } from './graficasDeMunicipio.ts'

const ELECCIONES = ['2021', '2024', 'Judicial 2025']
const BRECHAS = { municipio: [-2.5, 9.46, null], entidad: [7.86, 10.73, 3.0] }

describe('brecha por elección de un municipio', () => {
  it('pone una columna por elección, con la entidad como contexto', () => {
    const opcion = opcionDeBrechaPorEleccion(ELECCIONES, BRECHAS)
    expect(opcion.xAxis).toMatchObject({ type: 'category', data: ELECCIONES })
    expect(opcion.series).toMatchObject([
      { type: 'bar', name: 'Municipio', color: COLOR_MUNICIPIO },
      { type: 'bar', name: 'Entidad', color: COLOR_CONTEXTO },
    ])
  })

  it('redondea el extremo de cada columna, arriba o abajo según el signo, y deja vacías las que no tienen dato', () => {
    expect(opcionDeBrechaPorEleccion(ELECCIONES, BRECHAS).series).toMatchObject([
      {
        data: [
          { value: -2.5, itemStyle: { borderRadius: [0, 0, 4, 4] } },
          { value: 9.46, itemStyle: { borderRadius: [4, 4, 0, 0] } },
          null,
        ],
      },
      { data: [{ value: 7.86 }, { value: 10.73 }, { value: 3.0 }] },
    ])
  })

  it('su tabla redondea a un decimal y marca las elecciones sin dato', () => {
    expect(tablaDeBrechaPorEleccion(ELECCIONES, BRECHAS)).toEqual({
      columnas: ['Elección', 'Municipio', 'Entidad'],
      filas: [
        ['2021', '-2.5 puntos', '+7.9 puntos'],
        ['2024', '+9.5 puntos', '+10.7 puntos'],
        ['Judicial 2025', 'sin datos', '+3.0 puntos'],
      ],
    })
  })
})
