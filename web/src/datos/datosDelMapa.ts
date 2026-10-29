import type { GeometryCollection, Topology } from 'topojson-specification'

export interface Municipio {
  entidad: number
  municipio: number
  nombre: string
  brecha: readonly (number | null)[] // alineada con `elecciones`
  perfil_principal: PerfilPrincipal | null // null: el modelo no tiene celdas en el municipio
}

/** Id del perfil con más lista nominal 2024 de cada sexo; null si el modelo no tiene celdas de ese sexo. */
export type PerfilPrincipal = Record<Sexo, string | null>

export type TopologiaDeMexico = Topology<{
  municipios: GeometryCollection<{ entidad: number; municipio: number }>
  entidades: GeometryCollection<{ entidad: number }>
}>

export interface Entidad {
  clave: number
  nombre: string
  participacion: readonly ResultadoPorSexo[] // Campeche no tiene la judicial
  reparto: Readonly<Record<string, number>> // id del perfil → % de la lista nominal 2024 de su sexo en la entidad
  perfil_principal: PerfilPrincipal
}

/** Participación por sexo en una elección, en porcentaje; la brecha es mujeres − hombres. */
export interface ResultadoPorSexo {
  anio: number
  tipo: 'federal' | 'judicial'
  mujeres: number
  hombres: number
  brecha: number
}

export type Sexo = 'mujeres' | 'hombres'

export const SEXOS: readonly Sexo[] = ['mujeres', 'hombres'] // el orden en que el sitio los muestra

/** Solo los campos que usa el sitio hasta ahora; perfiles.json trae también etapas, textos y estrategias. */
export interface Perfil {
  id: string // como en celdas_k2_3.csv: mujeres_0, hombres_1…
  orden: number
  nombre: string
  sexo: Sexo
  color: string
  trayectoria: readonly { anio: number; participacion: number }[]
  judicial_2025: number
}

/** Brecha por grupo de edad de un ámbito; la judicial es null en Campeche, que no tiene datos. */
export interface CurvasDeBrecha {
  federal_2024: readonly (number | null)[]
  judicial_2025: readonly (number | null)[] | null
}

export interface BrechaPorEdad {
  grupos_de_edad: readonly string[]
  ambitos: readonly (CurvasDeBrecha & { clave: number; nombre: string })[] // clave 0: el total nacional
}

export interface DatosDelMapa {
  topologia: TopologiaDeMexico
  perfiles: readonly Perfil[]
  nacional: readonly ResultadoPorSexo[]
  brechaPorEdad: BrechaPorEdad
  entidades: readonly Entidad[]
  elecciones: readonly number[]
  municipios: readonly Municipio[]
}

/** Un municipio se identifica por su entidad y su clave del INE: la clave de municipio se repite entre entidades. */
export function claveDeMunicipio({ entidad, municipio }: { entidad: number; municipio: number }): string {
  return `${entidad}-${municipio}`
}

export type CargaDelMapa = { estado: 'lista'; datos: DatosDelMapa } | { estado: 'fallida'; mensaje: string }

/** Lee los JSON de scripts/exportar_web.py y scripts/preparar_geometria.sh. Nunca rechaza: el error se muestra. */
export async function cargarDatosDelMapa(): Promise<CargaDelMapa> {
  try {
    const [topologia, perfiles, nacional, brechaPorEdad, entidades, { elecciones, municipios }] = await Promise.all([
      leerJson<TopologiaDeMexico>('mexico.topo.json'),
      leerJson<Perfil[]>('perfiles.json'),
      leerJson<ResultadoPorSexo[]>('nacional.json'),
      leerJson<BrechaPorEdad>('brecha_edad.json'),
      leerJson<Entidad[]>('entidades.json'),
      leerJson<Pick<DatosDelMapa, 'elecciones' | 'municipios'>>('municipios.json'),
    ])
    return {
      estado: 'lista',
      datos: { topologia, perfiles, nacional, brechaPorEdad, entidades, elecciones, municipios },
    }
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
