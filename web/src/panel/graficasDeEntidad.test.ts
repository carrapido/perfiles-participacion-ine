import { describe, expect, it } from 'vitest'
import { opcionDeRepartoDePerfiles, tablaDeRepartoDePerfiles } from './graficasDeEntidad.ts'

const PERFILES = [
  { id: 'hombres_1', nombre: 'Hombres en rezago persistente', sexo: 'hombres', color: '#2A78D6' },
  { id: 'hombres_0', nombre: 'Hombres de voto presidencial', sexo: 'hombres', color: '#E8693A' },
  { id: 'mujeres_1', nombre: 'Mujeres urbanas en ascenso', sexo: 'mujeres', color: '#12366B' },
  { id: 'mujeres_0', nombre: 'Mujeres de voto constante', sexo: 'mujeres', color: '#D6517E' },
] as const

const ENTIDAD = {
  reparto: { hombres_0: 73.98, hombres_1: 26.02, mujeres_0: 12.27, mujeres_1: 87.73 },
  perfil_principal: { mujeres: 'mujeres_1', hombres: 'hombres_0' },
}

describe('reparto de perfiles de una entidad', () => {
  it('dibuja una barra apilada por sexo, mujeres primero', () => {
    const opcion = opcionDeRepartoDePerfiles([...PERFILES], ENTIDAD)
    expect(opcion.yAxis).toMatchObject({ type: 'category', data: ['Mujeres', 'Hombres'] })
    expect(opcion.xAxis).toMatchObject({ type: 'value', max: 100 })
  })

  it('trae un segmento por perfil, en la barra de su sexo, con su color fijo', () => {
    expect(opcionDeRepartoDePerfiles([...PERFILES], ENTIDAD).series).toMatchObject([
      { name: 'Hombres en rezago persistente', color: '#2A78D6', stack: 'reparto', data: [null, { value: 26.02 }] },
      { name: 'Hombres de voto presidencial', color: '#E8693A', stack: 'reparto', data: [null, { value: 73.98 }] },
      { name: 'Mujeres urbanas en ascenso', color: '#12366B', stack: 'reparto', data: [{ value: 87.73 }, null] },
      { name: 'Mujeres de voto constante', color: '#D6517E', stack: 'reparto', data: [{ value: 12.27 }, null] },
    ])
  })

  it('etiqueta solo el perfil principal de cada sexo, con texto que contraste con su color', () => {
    const series = opcionDeRepartoDePerfiles([...PERFILES], ENTIDAD).series
    expect(series).toMatchObject([
      { data: [null, { label: { show: false } }] },
      { data: [null, { label: { show: true, color: '#1a1a1a' } }] },
      { data: [{ label: { show: true, color: '#ffffff' } }, null] },
      { data: [{ label: { show: false } }, null] },
    ])
  })

  it('su tabla da el porcentaje de cada perfil con un decimal', () => {
    expect(tablaDeRepartoDePerfiles([...PERFILES], ENTIDAD)).toEqual({
      columnas: ['Perfil', '% de la lista nominal de su sexo'],
      filas: [
        ['Hombres en rezago persistente', '26.0%'],
        ['Hombres de voto presidencial', '74.0%'],
        ['Mujeres urbanas en ascenso', '87.7%'],
        ['Mujeres de voto constante', '12.3%'],
      ],
    })
  })
})
