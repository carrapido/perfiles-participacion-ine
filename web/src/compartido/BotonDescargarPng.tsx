import { useState, useTransition, type RefObject } from 'react'
import './botones.css'
import { descargarPng } from './descargarPng.ts'

interface Props {
  objetivo: RefObject<HTMLElement | null> // el nodo que se vuelve imagen
  nombreDelArchivo: string
}

/** Mientras se genera la imagen, el botón lo dice y no acepta otro clic (heurística 1 de Nielsen); si falla, lo explica. */
export function BotonDescargarPng({ objetivo, nombreDelArchivo }: Props) {
  const [generando, iniciarDescarga] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function descargar() {
    const nodo = objetivo.current
    if (!nodo) return
    setError(null)
    // Con una función async, useTransition deja generando en true hasta que termina: https://react.dev/reference/react/useTransition
    iniciarDescarga(async () => {
      try {
        await descargarPng(nodo, nombreDelArchivo)
      } catch (falla) {
        setError(falla instanceof Error ? falla.message : String(falla))
      }
    })
  }

  return (
    <>
      <button type="button" className="boton" onClick={descargar} disabled={generando}>
        {generando ? 'Generando la imagen…' : 'Descargar PNG'}
      </button>
      {error && <p role="alert">No se pudo generar la imagen: {error}</p>}
    </>
  )
}
