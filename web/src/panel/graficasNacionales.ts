import type { LineSeriesOption } from 'echarts/charts'
import { COLOR_CONTEXTO, COLOR_HOMBRES, COLOR_JUDICIAL, COLOR_MUJERES } from '../compartido/colores.ts'
import type { OpcionDeGrafica } from '../compartido/echarts.ts'
import type { Tabla } from '../compartido/FiguraDeDatos.tsx'
import { formatearBrecha, formatearPorcentaje } from '../compartido/formato.ts'
import type { CurvasDeBrecha, Perfil, ResultadoNacional } from '../datos/datosDelMapa.ts'

type PerfilParaValidar = Pick<Perfil, 'nombre' | 'color' | 'trayectoria' | 'judicial_2025'>

const ULTIMA_FEDERAL = 2024
const ELECCIONES_COMPARADAS = ['Federal 2024', 'Judicial 2025']

// Con dos series, cada línea lleva su nombre al final además de la leyenda (skill dataviz: identidad nunca solo por color)
const NOMBRE_AL_FINAL: LineSeriesOption['endLabel'] = { show: true, formatter: '{a}' }

export function opcionDeParticipacionPorSexo(nacional: ResultadoNacional[]): OpcionDeGrafica {
  const federales = soloFederales(nacional)
  return {
    ...baseDeLineas((valor) => formatearPorcentaje(valor, 2)),
    grid: { top: 32, right: 72, bottom: 24, left: 44 },
    xAxis: { type: 'category', data: federales.map(({ anio }) => String(anio)), boundaryGap: false },
    yAxis: { type: 'value', axisLabel: { formatter: '{value}%' } },
    series: [
      { ...linea('Mujeres', federales.map(({ mujeres }) => mujeres), COLOR_MUJERES), endLabel: NOMBRE_AL_FINAL },
      { ...linea('Hombres', federales.map(({ hombres }) => hombres), COLOR_HOMBRES), endLabel: NOMBRE_AL_FINAL },
    ],
  }
}

export function tablaDeParticipacionPorSexo(nacional: ResultadoNacional[]): Tabla {
  return {
    columnas: ['Elección', 'Mujeres', 'Hombres', 'Brecha'],
    filas: soloFederales(nacional).map(({ anio, mujeres, hombres, brecha }) => [
      String(anio),
      formatearPorcentaje(mujeres, 2),
      formatearPorcentaje(hombres, 2),
      formatearBrecha(brecha, 2),
    ]),
  }
}

export function opcionDeBrechaPorEdad(grupos: string[], curvas: CurvasDeBrecha): OpcionDeGrafica {
  return {
    ...baseDeLineas((valor) => formatearBrecha(valor)),
    grid: { top: 32, right: 96, bottom: 24, left: 36 },
    // onZero false: con brechas negativas, las etiquetas de edad se quedan abajo y no cruzan las líneas
    xAxis: { type: 'category', data: grupos, boundaryGap: false, axisLine: { onZero: false } },
    yAxis: { type: 'value' },
    series: [
      { ...linea('Federal 2024', curvas.federal_2024, COLOR_CONTEXTO), endLabel: NOMBRE_AL_FINAL },
      { ...linea('Judicial 2025', curvas.judicial_2025 ?? [], COLOR_JUDICIAL), endLabel: NOMBRE_AL_FINAL },
    ],
  }
}

export function tablaDeBrechaPorEdad(grupos: string[], curvas: CurvasDeBrecha): Tabla {
  return {
    columnas: ['Edad', ...ELECCIONES_COMPARADAS],
    filas: grupos.map((grupo, posicion) => [
      grupo,
      formatearBrecha(curvas.federal_2024[posicion] ?? null),
      formatearBrecha(curvas.judicial_2025?.[posicion] ?? null),
    ]),
  }
}

/** Cinco series: van con leyenda y tabla; sus nombres son largos para etiquetarlos al final de cada línea. */
export function opcionDeValidacionJudicial(perfiles: PerfilParaValidar[]): OpcionDeGrafica {
  return {
    ...baseDeLineas((valor) => formatearPorcentaje(valor)),
    grid: { top: 96, right: 16, bottom: 24, left: 44 },
    xAxis: { type: 'category', data: ELECCIONES_COMPARADAS },
    yAxis: { type: 'value', axisLabel: { formatter: '{value}%' } },
    series: perfiles.map((perfil) => linea(perfil.nombre, [participacionFederal(perfil), perfil.judicial_2025], perfil.color)),
  }
}

export function tablaDeValidacionJudicial(perfiles: PerfilParaValidar[]): Tabla {
  return {
    columnas: ['Perfil', ...ELECCIONES_COMPARADAS],
    filas: perfiles.map((perfil) => [
      perfil.nombre,
      formatearPorcentaje(participacionFederal(perfil)),
      formatearPorcentaje(perfil.judicial_2025),
    ]),
  }
}

function soloFederales(nacional: ResultadoNacional[]): ResultadoNacional[] {
  return nacional.filter((eleccion) => eleccion.tipo === 'federal')
}

function participacionFederal({ trayectoria }: PerfilParaValidar): number | null {
  return trayectoria.find((punto) => punto.anio === ULTIMA_FEDERAL)?.participacion ?? null
}

/** Tooltip con cruz vertical en todo el eje (skill dataviz: la capa de hover va por omisión), leyenda y aria. */
function baseDeLineas(formatear: (valor: number | null) => string): OpcionDeGrafica {
  return {
    aria: { enabled: true },
    legend: { top: 0, left: 0 },
    tooltip: {
      trigger: 'axis',
      valueFormatter: (valor) => formatear(typeof valor === 'number' ? valor : null),
    },
  }
}

function linea(name: string, data: (number | null)[], color: string): LineSeriesOption {
  return { type: 'line', name, data, color }
}
