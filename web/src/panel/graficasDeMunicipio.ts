import type { BarSeriesOption } from 'echarts/charts'
import { baseDeGrafica } from '../compartido/baseDeGrafica.ts'
import { COLOR_CONTEXTO, COLOR_MUNICIPIO } from '../compartido/colores.ts'
import type { OpcionDeGrafica } from '../compartido/echarts.ts'
import type { Tabla } from '../compartido/TablaDeDatos.tsx'
import { formatearBrecha } from '../compartido/formato.ts'

/** Brechas alineadas con las elecciones; null donde no hubo votos o la entidad no tuvo judicial. */
export interface BrechasPorEleccion {
  municipio: readonly (number | null)[]
  entidad: readonly (number | null)[]
}

// Columnas y no líneas: la judicial es otra clase de elección, y una línea la uniría a las federales como si siguiera
// su tendencia
export function opcionDeBrechaPorEleccion(elecciones: readonly string[], brechas: BrechasPorEleccion): OpcionDeGrafica {
  return {
    ...baseDeGrafica((valor) => formatearBrecha(valor), { trigger: 'axis', axisPointer: { type: 'shadow' } }),
    grid: { top: 32, right: 16, bottom: 40, left: 36 },
    // onZero false: con brechas negativas, los nombres de las elecciones se quedan abajo y no cruzan las columnas.
    // interval 0 muestra todas las elecciones; "Judicial 2025" no cabe en una columna y se parte en dos renglones
    xAxis: {
      type: 'category',
      data: [...elecciones],
      axisLine: { onZero: false },
      axisLabel: { interval: 0, width: 56, overflow: 'break' },
    },
    yAxis: { type: 'value' },
    series: [columnas('Municipio', brechas.municipio, COLOR_MUNICIPIO), columnas('Entidad', brechas.entidad, COLOR_CONTEXTO)],
  }
}

export function tablaDeBrechaPorEleccion(elecciones: readonly string[], { municipio, entidad }: BrechasPorEleccion): Tabla {
  return {
    columnas: ['Elección', 'Municipio', 'Entidad'],
    filas: elecciones.map((eleccion, posicion) => [
      eleccion,
      formatearBrecha(municipio[posicion] ?? null),
      formatearBrecha(entidad[posicion] ?? null),
    ]),
  }
}

function columnas(name: string, brechas: readonly (number | null)[], color: string): BarSeriesOption {
  return { type: 'bar', name, color, data: brechas.map((brecha) => (brecha === null ? null : columna(brecha))) }
}

// El extremo del dato va redondeado y la base, sobre el cero, recta (skill dataviz, marks-and-anatomy)
function columna(brecha: number) {
  return { value: brecha, itemStyle: { borderRadius: brecha < 0 ? [0, 0, 4, 4] : [4, 4, 0, 0] } }
}
