import type { GeometryCollection, Topology } from 'topojson-specification'

export interface Municipio {
  entidad: number
  municipio: number
  nombre: string
  brecha: (number | null)[] // alineada con `elecciones`
  perfil_principal: { mujeres: string | null; hombres: string | null } | null
}

export type TopologiaDeMexico = Topology<{
  municipios: GeometryCollection<{ entidad: number; municipio: number }>
  entidades: GeometryCollection<{ entidad: number }>
}>

export interface Entidad {
  clave: number
  nombre: string
}

export interface DatosDelMapa {
  topologia: TopologiaDeMexico
  entidades: Entidad[]
  elecciones: number[]
  municipios: Municipio[]
}

/** Un municipio se identifica por su entidad y su clave del INE: la clave de municipio se repite entre entidades. */
export function claveDeMunicipio({ entidad, municipio }: { entidad: number; municipio: number }): string {
  return `${entidad}-${municipio}`
}

export type CargaDelMapa = { estado: 'lista'; datos: DatosDelMapa } | { estado: 'fallida'; mensaje: string }

/** Lee los JSON de scripts/exportar_web.py y scripts/preparar_geometria.sh. Nunca rechaza: el error se muestra. */
export async function cargarDatosDelMapa(): Promise<CargaDelMapa> {
  try {
    const [topologia, entidades, { elecciones, municipios }] = await Promise.all([
      leerJson<TopologiaDeMexico>('mexico.topo.json'),
      leerJson<Entidad[]>('entidades.json'),
      leerJson<Pick<DatosDelMapa, 'elecciones' | 'municipios'>>('municipios.json'),
    ])
    return { estado: 'lista', datos: { topologia, entidades, elecciones, municipios } }
  } catch (error) {
    return { estado: 'fallida', mensaje: error instanceof Error ? error.message : String(error) }
  }
}

// La forma de cada archivo la fijan las pruebas de Python: tests/test_geometria.py, tests/test_exportar_web.py y
// tests/test_exportar_municipios.py
async function leerJson<T>(archivo: string): Promise<T> {
  const respuesta = await fetch(`${import.meta.env.BASE_URL}data/${archivo}`)
  if (!respuesta.ok) throw new Error(`No se pudo leer ${archivo} (HTTP ${respuesta.status})`)
  return respuesta.json()
}
