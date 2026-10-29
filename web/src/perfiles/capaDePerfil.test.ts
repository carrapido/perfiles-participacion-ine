import { describe, expect, it } from 'vitest'
import { COLOR_SIN_DATOS } from '../compartido/colores.ts'
import { colorearPorPerfil } from './capaDePerfil.ts'

const TRAZOS = [
  { entidad: 1, municipio: 1, trazo: 'M0,0Z' },
  { entidad: 1, municipio: 2, trazo: 'M1,1Z' },
  { entidad: 2, municipio: 1, trazo: 'M2,2Z' },
]
const DATOS = {
  municipios: [
    { entidad: 1, municipio: 1, nombre: 'Uno', brecha: [], perfil_principal: { mujeres: 'mujeres_0', hombres: 'hombres_1' } },
    { entidad: 1, municipio: 2, nombre: 'Dos', brecha: [], perfil_principal: { mujeres: 'mujeres_1', hombres: null } },
    { entidad: 2, municipio: 1, nombre: 'Tres', brecha: [], perfil_principal: null },
  ],
  perfiles: [
    { id: 'hombres_1', nombre: 'Hombres en rezago persistente', sexo: 'hombres', color: '#2A78D6' },
    { id: 'mujeres_1', nombre: 'Mujeres urbanas en ascenso', sexo: 'mujeres', color: '#12366B' },
    { id: 'mujeres_0', nombre: 'Mujeres de voto constante', sexo: 'mujeres', color: '#D6517E' },
  ],
} as const

describe('colorearPorPerfil', () => {
  it('pinta cada municipio con el color de su perfil principal del sexo elegido', () => {
    const colores = colorearPorPerfil(TRAZOS, DATOS, 'mujeres').map((municipio) => municipio.color)
    expect(colores).toEqual(['#D6517E', '#12366B', COLOR_SIN_DATOS])
  })

  it('pinta de gris el municipio que no tiene perfil del sexo elegido', () => {
    const [, dos] = colorearPorPerfil(TRAZOS, DATOS, 'hombres')
    expect(dos.color).toBe(COLOR_SIN_DATOS)
  })

  it('describe cada municipio con su nombre y su perfil', () => {
    const descripciones = colorearPorPerfil(TRAZOS, DATOS, 'hombres').map((municipio) => municipio.descripcion)
    expect(descripciones).toEqual(['Uno: Hombres en rezago persistente', 'Dos: sin perfil', 'Tres: sin perfil'])
  })
})
