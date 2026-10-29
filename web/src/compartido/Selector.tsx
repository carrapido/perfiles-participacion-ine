import { useId } from 'react'
import './Selector.css'

interface Opcion<T> {
  valor: T
  etiqueta: string
}

interface Props<T extends string | number> {
  leyenda: string
  opciones: readonly Opcion<T>[]
  valor: T
  alCambiar: (valor: T) => void
}

/** Botones de opción nativos: el teclado y los lectores de pantalla funcionan sin código extra. */
export function Selector<T extends string | number>({ leyenda, opciones, valor, alCambiar }: Props<T>) {
  const grupo = useId()
  return (
    <fieldset className="selector">
      <legend className="selector__leyenda">{leyenda}</legend>
      <div className="selector__opciones">
        {opciones.map((opcion) => (
          <label key={opcion.valor} className="selector__opcion">
            <input
              type="radio"
              name={grupo}
              checked={opcion.valor === valor}
              onChange={() => alCambiar(opcion.valor)}
            />
            <span>{opcion.etiqueta}</span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}
