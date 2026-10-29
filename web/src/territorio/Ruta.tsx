import { NACIONAL, type NivelDeZoom } from './nivelDeZoom.ts'
import type { PasoDeLaRuta } from './ruta.ts'
import '../compartido/botones.css'
import './Ruta.css'

interface Props {
  pasos: PasoDeLaRuta[]
  alElegir: (destino: NivelDeZoom) => void
}

/** Muestra dónde está el mapa y deja salir de cualquier zoom (heurísticas 1 y 3 de Nielsen). */
export function Ruta({ pasos, alElegir }: Props) {
  const ultimo = pasos.length - 1
  return (
    <div className="ruta">
      <nav aria-label="Ubicación en el mapa">
        <ol className="ruta__pasos">
          {pasos.map((paso, posicion) => (
            <li key={paso.destino.nivel}>
              {posicion === ultimo ? (
                <span aria-current="location">{paso.etiqueta}</span>
              ) : (
                <button type="button" className="boton-enlace" onClick={() => alElegir(paso.destino)}>
                  {paso.etiqueta}
                </button>
              )}
            </li>
          ))}
        </ol>
      </nav>
      {ultimo > 0 && (
        <button type="button" className="boton" onClick={() => alElegir(NACIONAL)}>
          Volver a México
        </button>
      )}
    </div>
  )
}
