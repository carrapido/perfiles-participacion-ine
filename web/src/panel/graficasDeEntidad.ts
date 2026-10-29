import type { BarSeriesOption } from 'echarts/charts'
import { ARRIBA_DE_CINCO_PERFILES, baseDeGrafica } from '../compartido/baseDeGrafica.ts'
import { colorDeTextoSobre } from '../compartido/contraste.ts'
import type { OpcionDeGrafica } from '../compartido/echarts.ts'
import type { Tabla } from '../compartido/TablaDeDatos.tsx'
import { formatearPorcentaje } from '../compartido/formato.ts'
import { SEXOS, type Entidad, type Perfil } from '../datos/datosDelMapa.ts'

type PerfilDelReparto = Pick<Perfil, 'id' | 'nombre' | 'sexo' | 'color'>
type RepartoDeEntidad = Pick<Entidad, 'reparto' | 'perfil_principal'>

// Una barra por sexo, de arriba abajo en el orden de SEXOS
const NOMBRES_DE_SEXO = ['Mujeres', 'Hombres']

/** Parte de un todo: una barra apilada al 100 % por sexo, un segmento por perfil (skill dataviz, choosing-a-form). */
export function opcionDeRepartoDePerfiles(perfiles: readonly PerfilDelReparto[], entidad: RepartoDeEntidad): OpcionDeGrafica {
  return {
    ...baseDeGrafica((valor) => formatearPorcentaje(valor), { trigger: 'item' }),
    grid: { top: ARRIBA_DE_CINCO_PERFILES, right: 16, bottom: 24, left: 64 },
    xAxis: { type: 'value', max: 100, axisLabel: { formatter: '{value}%' } },
    yAxis: { type: 'category', data: NOMBRES_DE_SEXO, inverse: true },
    series: perfiles.map((perfil) => segmento(perfil, entidad)),
  }
}

export function tablaDeRepartoDePerfiles(perfiles: readonly PerfilDelReparto[], { reparto }: RepartoDeEntidad): Tabla {
  return {
    columnas: ['Perfil', '% de la lista nominal de su sexo'],
    filas: perfiles.map((perfil) => [perfil.nombre, formatearPorcentaje(reparto[perfil.id])]),
  }
}

function segmento(perfil: PerfilDelReparto, { reparto, perfil_principal }: RepartoDeEntidad): BarSeriesOption {
  const porcentaje = reparto[perfil.id] // exportar_web.py incluye todos los perfiles, con 0 si no tiene celdas
  const esPrincipal = perfil_principal[perfil.sexo] === perfil.id
  return {
    type: 'bar',
    name: perfil.nombre,
    color: perfil.color,
    stack: 'reparto',
    data: SEXOS.map((sexo) => (sexo === perfil.sexo ? { value: porcentaje, label: cifraAdentro(esPrincipal, porcentaje, perfil.color) } : null)),
  }
}

// Solo el perfil principal lleva su cifra: ocupa al menos un tercio de su barra (la mitad en las mujeres, que tienen dos
// perfiles), así que siempre cabe. Los demás segmentos se leen en el tooltip y en la tabla (skill dataviz, marks-and-anatomy)
function cifraAdentro(seMuestra: boolean, porcentaje: number, fondo: string): BarSeriesOption['label'] {
  return { show: seMuestra, position: 'inside', formatter: formatearPorcentaje(porcentaje), color: colorDeTextoSobre(fondo) }
}
