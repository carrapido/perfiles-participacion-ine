import { init, type EChartsType } from 'echarts/core'
import { useEffect, useRef } from 'react'
import { TEMA, type OpcionDeGrafica } from './echarts.ts'
import './Grafica.css'

/** ECharts es imperativo: la instancia vive en un efecto, igual que d3-zoom en el mapa. */
export function Grafica({ opcion }: { opcion: OpcionDeGrafica }) {
  const contenedorRef = useRef<HTMLDivElement>(null)
  const graficaRef = useRef<EChartsType | null>(null)

  useEffect(() => {
    const contenedor = contenedorRef.current
    if (!contenedor) return
    const grafica = init(contenedor, TEMA, { renderer: 'svg' })
    graficaRef.current = grafica
    // ECharts no se entera solo de que cambió su contenedor: hay que llamar resize()
    const observador = new ResizeObserver(() => grafica.resize())
    observador.observe(contenedor)
    return () => {
      observador.disconnect()
      grafica.dispose()
      graficaRef.current = null
    }
  }, [])

  useEffect(() => {
    graficaRef.current?.setOption(opcion, { notMerge: true })
  }, [opcion])

  return <div ref={contenedorRef} className="grafica" />
}
