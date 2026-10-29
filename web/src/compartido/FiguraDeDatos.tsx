import type { OpcionDeGrafica } from './echarts.ts'
import { FUERA_DE_LA_IMAGEN } from './descargarPng.ts'
import { Grafica } from './Grafica.tsx'
import { TablaDeDatos, type Tabla } from './TablaDeDatos.tsx'
import './FiguraDeDatos.css'

interface Props {
  titulo: string
  opcion: OpcionDeGrafica
  tabla: Tabla
}

export function FiguraDeDatos({ titulo, opcion, tabla }: Props) {
  return (
    <figure className="figura">
      <h3 className="figura__titulo">{titulo}</h3>
      <Grafica opcion={opcion} />
      <details className="figura__tabla" {...FUERA_DE_LA_IMAGEN}>
        <summary>Ver los datos en tabla</summary>
        <TablaDeDatos tabla={tabla} />
      </details>
      <figcaption className="figura__fuente">Fuente: INE, Conteos Censales de Participación Ciudadana.</figcaption>
    </figure>
  )
}
