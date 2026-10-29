import { describe, expect, it } from 'vitest'
import { colorearPorPerfil } from './capaDePerfil.ts'

const TRAZOS = [
  { entidad: 7, municipio: 64, trazo: 'M0,0Z' },
  { entidad: 20, municipio: 1, trazo: 'M1,1Z' },
]
const SIN_CONTEO_EN_2021 = { causa: 'sin_conteo', elecciones: [2021] } as const
const DATOS = {
  municipios: [
    {
      entidad: 7,
      municipio: 64,
      nombre: 'Oxchuc',
      perfil_principal: null,
      sin_perfil: { mujeres: SIN_CONTEO_EN_2021, hombres: SIN_CONTEO_EN_2021 },
    },
    {
      entidad: 20,
      municipio: 1,
      nombre: 'Abejones',
      perfil_principal: { mujeres: 'mujeres_0', hombres: null },
      sin_perfil: { hombres: { causa: 'lista_nominal_chica', minima: 100 } },
    },
  ],
  perfiles: [{ id: 'mujeres_0', nombre: 'Mujeres de voto constante', sexo: 'mujeres', color: '#D6517E' }],
} as const

describe('colorearPorPerfil, en los municipios sin perfil', () => {
  it('explica por qué el municipio no tiene perfil del sexo elegido', () => {
    const descripciones = colorearPorPerfil(TRAZOS, DATOS, 'hombres').map((municipio) => municipio.descripcion)
    expect(descripciones).toEqual([
      'Oxchuc: sin perfil porque los conteos censales no tienen datos de participación de 2021',
      'Abejones: sin perfil porque ningún grupo de edad llega a 100 personas en la lista nominal en todas las elecciones',
    ])
  })

  it('no da causa donde sí hay perfil del sexo elegido', () => {
    const [, abejones] = colorearPorPerfil(TRAZOS, DATOS, 'mujeres')
    expect(abejones.descripcion).toBe('Abejones: Mujeres de voto constante')
  })
})
