import type { OpcionDeGrafica } from './echarts.ts'
import { Grafica } from './Grafica.tsx'
import './FiguraDeDatos.css'

/** La misma información de la gráfica, en texto: el valor nunca depende solo del tooltip ni del color. */
export interface Tabla {
  columnas: string[]
  filas: string[][] // la primera celda de cada fila la identifica
}

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
      <details className="figura__tabla">
        <summary>Ver los datos en tabla</summary>
        <table>
          <thead>
            <tr>
              {tabla.columnas.map((columna) => (
                <th key={columna} scope="col">
                  {columna}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tabla.filas.map(([encabezado, ...celdas]) => (
              <tr key={encabezado}>
                <th scope="row">{encabezado}</th>
                {celdas.map((celda, posicion) => (
                  <td key={posicion}>{celda}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </details>
      <figcaption className="figura__fuente">Fuente: INE, Conteos Censales de Participación Ciudadana.</figcaption>
    </figure>
  )
}
