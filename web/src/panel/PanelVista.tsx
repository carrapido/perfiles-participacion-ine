import { useId, type ReactNode } from 'react'
import { FiguraDeDatos } from '../compartido/FiguraDeDatos.tsx'
import type { Figura } from './figuras.ts'
import './Panel.css'

interface Props {
  titulo: string
  figuras: Figura[]
  children?: ReactNode // lo que va después de las gráficas
}

export function PanelVista({ titulo, figuras, children }: Props) {
  const idDelTitulo = useId()
  return (
    <section className="panel" aria-labelledby={idDelTitulo}>
      {/* aria-live: el lector de pantalla anuncia el territorio nuevo cuando el clic en el mapa cambia el panel */}
      <h2 id={idDelTitulo} className="panel__titulo" aria-live="polite">
        {titulo}
      </h2>
      {figuras.map((figura) => (
        <FiguraDeDatos key={figura.titulo} {...figura} />
      ))}
      {children}
    </section>
  )
}
