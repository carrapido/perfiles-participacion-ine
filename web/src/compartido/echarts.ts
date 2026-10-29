import { LineChart, type LineSeriesOption } from 'echarts/charts'
import {
  AriaComponent,
  GridComponent,
  LegendComponent,
  TooltipComponent,
  type AriaComponentOption,
  type GridComponentOption,
  type LegendComponentOption,
  type TooltipComponentOption,
} from 'echarts/components'
// Alias: el use() de ECharts no es el hook de React, y con su nombre original confunde a rules-of-hooks
import { registerTheme, use as registrarModulos, type ComposeOption } from 'echarts/core'
import { SVGRenderer } from 'echarts/renderers'
import { COLOR_REJILLA, COLOR_TEXTO, COLOR_TEXTO_SECUNDARIO } from './colores.ts'

export type OpcionDeGrafica = ComposeOption<
  LineSeriesOption | GridComponentOption | TooltipComponentOption | LegendComponentOption | AriaComponentOption
>

export const TEMA = 'sitio'

// Solo lo que usan las gráficas del panel, para no cargar ECharts completo
// https://echarts.apache.org/handbook/en/basics/import/
registrarModulos([LineChart, GridComponent, TooltipComponent, LegendComponent, AriaComponent, SVGRenderer])

// Líneas de 2 px, marcadores de 8 px y rejilla discreta (skill dataviz, marks-and-anatomy)
registerTheme(TEMA, {
  textStyle: { fontFamily: "'Inter Variable', system-ui, sans-serif", color: COLOR_TEXTO },
  legend: { textStyle: { color: COLOR_TEXTO } },
  categoryAxis: {
    axisLine: { lineStyle: { color: COLOR_TEXTO_SECUNDARIO } },
    axisTick: { show: false },
    axisLabel: { color: COLOR_TEXTO_SECUNDARIO },
    splitLine: { show: false },
  },
  valueAxis: {
    axisLine: { show: false },
    axisLabel: { color: COLOR_TEXTO_SECUNDARIO },
    splitLine: { lineStyle: { color: COLOR_REJILLA } },
  },
  line: { symbolSize: 8, lineStyle: { width: 2 } },
})
