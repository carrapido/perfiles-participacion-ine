import { describe, expect, it } from 'vitest'
import { colorearPorBrecha } from './capaDeBrecha.ts'
import { COLOR_SIN_DATOS, colorDeBrecha } from './colorDeBrecha.ts'

const TRAZOS = [
  { entidad: 1, municipio: 1, trazo: 'M0,0L1,0L1,1Z' },
  { entidad: 7, municipio: 30, trazo: 'M2,2L3,2L3,3Z' },
]
const DATOS = {
  elecciones: [2021, 2024],
  municipios: [
    { entidad: 1, municipio: 1, nombre: 'Aguascalientes', brecha: [5, 12.34], perfil_principal: null },
    { entidad: 7, municipio: 30, nombre: 'Chicomuselo', brecha: [11.03, null], perfil_principal: null },
  ],
}

describe('colorearPorBrecha', () => {
  it('colorea cada municipio con su brecha en la elección elegida', () => {
    const [aguascalientes, chicomuselo] = colorearPorBrecha(TRAZOS, DATOS, 2024)
    expect(aguascalientes.color).toBe(colorDeBrecha(12.34))
    expect(chicomuselo.color).toBe(COLOR_SIN_DATOS)
  })

  it('describe cada municipio con su nombre y su brecha redondeada', () => {
    const descripciones = colorearPorBrecha(TRAZOS, DATOS, 2024).map((municipio) => municipio.descripcion)
    expect(descripciones).toEqual(['Aguascalientes: +12.3 puntos', 'Chicomuselo: sin datos'])
  })

  it('conserva la clave y el trazo de cada municipio', () => {
    const [aguascalientes] = colorearPorBrecha(TRAZOS, DATOS, 2021)
    expect(aguascalientes).toMatchObject(TRAZOS[0])
  })
})
