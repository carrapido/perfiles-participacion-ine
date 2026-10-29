import type { TooltipComponentOption } from 'echarts/components'
import type { OpcionDeGrafica } from '../compartido/echarts.ts'

/** Tooltip (skill dataviz: la capa de hover va por omisión), leyenda y aria; el tooltip por eje pone una guía vertical. */
export function baseDeGrafica(
  formatear: (valor: number | null) => string,
  tooltip: TooltipComponentOption = { trigger: 'axis' },
): OpcionDeGrafica {
  return {
    aria: { enabled: true },
    legend: { top: 0, left: 0 },
    tooltip: { ...tooltip, valueFormatter: (valor) => formatear(typeof valor === 'number' ? valor : null) },
  }
}
