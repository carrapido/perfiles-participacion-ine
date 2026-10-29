import type { OpcionDeGrafica } from '../compartido/echarts.ts'
import type { Tabla } from '../compartido/FiguraDeDatos.tsx'
import { claveDeMunicipio, type BrechaPorEdad, type DatosDelMapa, type ResultadoPorSexo } from '../datos/datosDelMapa.ts'
import { opcionesDeEleccion } from '../datos/elecciones.ts'
import type { NivelDeZoom } from '../territorio/nivelDeZoom.ts'
import { opcionDeRepartoDePerfiles, tablaDeRepartoDePerfiles } from './graficasDeEntidad.ts'
import { opcionDeBrechaPorEleccion, tablaDeBrechaPorEleccion } from './graficasDeMunicipio.ts'
import {
  opcionDeBrechaPorEdad,
  opcionDeParticipacionPorSexo,
  opcionDeValidacionJudicial,
  tablaDeBrechaPorEdad,
  tablaDeParticipacionPorSexo,
  tablaDeValidacionJudicial,
} from './graficasNacionales.ts'

export interface Figura {
  titulo: string
  opcion: OpcionDeGrafica
  tabla: Tabla
}

type DatosDelPanel = Omit<DatosDelMapa, 'topologia'>

const CLAVE_NACIONAL = 0 // en brecha_edad.json, el ámbito 0 es el total nacional

/** Las gráficas del panel siguen al zoom del mapa: México, una entidad o un municipio (resume.md, sección 6). */
export function figurasDel(nivelDeZoom: NivelDeZoom, datos: DatosDelPanel): Figura[] {
  switch (nivelDeZoom.nivel) {
    case 'nacional':
      return figurasNacionales(datos)
    case 'entidad':
      return figurasDeEntidad(datos, nivelDeZoom.entidad)
    case 'municipio':
      return figurasDeMunicipio(datos, nivelDeZoom)
  }
}

function figurasNacionales({ nacional, brechaPorEdad, perfiles }: DatosDelPanel): Figura[] {
  return [
    figuraDeParticipacionPorSexo(nacional),
    ...figuraDeBrechaPorEdad(brechaPorEdad, CLAVE_NACIONAL),
    {
      titulo: 'Participación de cada perfil: federal 2024 y judicial 2025',
      opcion: opcionDeValidacionJudicial(perfiles),
      tabla: tablaDeValidacionJudicial(perfiles),
    },
  ]
}

function figurasDeEntidad({ entidades, brechaPorEdad, perfiles }: DatosDelPanel, clave: number): Figura[] {
  const entidad = entidades.find((candidata) => candidata.clave === clave)
  if (!entidad) return []
  return [
    figuraDeParticipacionPorSexo(entidad.participacion),
    {
      titulo: 'Reparto de la lista nominal 2024 por perfil',
      opcion: opcionDeRepartoDePerfiles(perfiles, entidad),
      tabla: tablaDeRepartoDePerfiles(perfiles, entidad),
    },
    ...figuraDeBrechaPorEdad(brechaPorEdad, clave),
  ]
}

// El eje sigue las mismas elecciones que el selector del mapa; cada brecha se busca por año
function figurasDeMunicipio(
  { nacional, elecciones, entidades, municipios }: DatosDelPanel,
  clave: { entidad: number; municipio: number },
): Figura[] {
  const municipio = municipios.find((candidato) => claveDeMunicipio(candidato) === claveDeMunicipio(clave))
  const entidad = entidades.find((candidata) => candidata.clave === clave.entidad)
  if (!municipio || !entidad) return []
  const opciones = opcionesDeEleccion(nacional)
  const etiquetas = opciones.map(({ etiqueta }) => etiqueta)
  const brechas = {
    municipio: opciones.map(({ valor }) => municipio.brecha[elecciones.indexOf(valor)] ?? null),
    entidad: opciones.map(({ valor }) => brechaEn(entidad.participacion, valor)),
  }
  return [
    {
      titulo: 'Brecha mujeres − hombres por elección, en puntos',
      opcion: opcionDeBrechaPorEleccion(etiquetas, brechas),
      tabla: tablaDeBrechaPorEleccion(etiquetas, brechas),
    },
  ]
}

function figuraDeParticipacionPorSexo(participacion: readonly ResultadoPorSexo[]): Figura {
  return {
    titulo: 'Participación por sexo en las elecciones federales',
    opcion: opcionDeParticipacionPorSexo(participacion),
    tabla: tablaDeParticipacionPorSexo(participacion),
  }
}

// Ninguna o una figura: un ámbito sin curvas no deja un hueco en el panel
function figuraDeBrechaPorEdad({ grupos_de_edad, ambitos }: BrechaPorEdad, clave: number): Figura[] {
  const curvas = ambitos.find((ambito) => ambito.clave === clave)
  if (!curvas) return []
  return [
    {
      titulo: 'Brecha por edad, en puntos',
      opcion: opcionDeBrechaPorEdad(grupos_de_edad, curvas),
      tabla: tablaDeBrechaPorEdad(grupos_de_edad, curvas),
    },
  ]
}

function brechaEn(participacion: readonly ResultadoPorSexo[], anio: number): number | null {
  return participacion.find((eleccion) => eleccion.anio === anio)?.brecha ?? null
}
