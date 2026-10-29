import './TablaDeDatos.css'

/** La misma información de la gráfica, en texto: el valor nunca depende solo del tooltip ni del color. */
export interface Tabla {
  columnas: string[]
  filas: string[][] // la primera celda de cada fila la identifica
}

export function TablaDeDatos({ tabla }: { tabla: Tabla }) {
  return (
    <table className="tabla">
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
  )
}
