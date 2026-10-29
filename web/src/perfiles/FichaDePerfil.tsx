import { useEffect, useId, useMemo, useRef } from 'react'
import '../compartido/botones.css'
import { BotonDescargarPng } from '../compartido/BotonDescargarPng.tsx'
import { FUERA_DE_LA_IMAGEN } from '../compartido/descargarPng.ts'
import { FiguraDeDatos } from '../compartido/FiguraDeDatos.tsx'
import { formatearPorcentaje } from '../compartido/formato.ts'
import { nombreDeArchivo } from '../compartido/nombreDeArchivo.ts'
import { sexoConArticulo } from '../compartido/sexoConArticulo.ts'
import { TablaDeDatos } from '../compartido/TablaDeDatos.tsx'
import type { Perfil, ResultadoPorSexo } from '../datos/datosDelMapa.ts'
import { opcionDeTrayectoria, pesoDelPerfil, tablaDeJudicial, tablaDeTrayectoria } from './fichaDePerfil.ts'
import './FichaDePerfil.css'

interface Props {
  perfil: Perfil
  nacional: readonly ResultadoPorSexo[]
  alCerrar: () => void
}

/**
 * Ficha de un perfil en un <dialog> modal: showModal() atrapa el foco, deja inerte el resto de la página y cierra con Esc
 * (https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog). Se monta abierta y se desmonta al cerrar.
 */
export function FichaDePerfil({ perfil, nacional, alCerrar }: Props) {
  const dialogoRef = useRef<HTMLDialogElement>(null)
  const contenidoRef = useRef<HTMLDivElement>(null) // lo que sale en el PNG: el diálogo tiene scroll y recortaría la imagen
  const idDelTitulo = useId()
  const trayectoria = useMemo(
    () => ({
      titulo: 'Participación en las elecciones federales',
      opcion: opcionDeTrayectoria(perfil, nacional),
      tabla: tablaDeTrayectoria(perfil, nacional),
    }),
    [perfil, nacional],
  )

  // Sin limpieza: cerrar el diálogo dispara onClose, y en StrictMode cerraría la ficha recién abierta
  useEffect(() => {
    dialogoRef.current?.showModal()
  }, [])

  return (
    <dialog ref={dialogoRef} className="ficha" aria-labelledby={idDelTitulo} onClose={alCerrar}>
      <div ref={contenidoRef} className="ficha__contenido">
        <header className="ficha__encabezado">
          <h2 id={idDelTitulo} className="ficha__nombre">
            <span className="ficha__muestra" style={{ background: perfil.color }} />
            {perfil.nombre}
          </h2>
          <div className="ficha__acciones" {...FUERA_DE_LA_IMAGEN}>
            <BotonDescargarPng objetivo={contenidoRef} nombreDelArchivo={nombreDeArchivo(`Ficha ${perfil.nombre}`, 'png')} />
            <form method="dialog">
              <button className="boton">Cerrar</button>
            </form>
          </div>
        </header>
        <p className="ficha__peso">{pesoDelPerfil(perfil)}</p>
        <p className="ficha__resumen">{perfil.resumen}</p>

        <div className="ficha__columnas">
          <section>
            <h3>Quiénes son</h3>
            <p>{perfil.quienes}</p>
          </section>
          <section>
            <h3>Dónde pesa</h3>
            <p>{perfil.donde}</p>
            <p className="ficha__nota">Porcentaje de {sexoConArticulo(perfil.sexo)} de cada entidad que son de este perfil:</p>
            <ol className="ficha__entidades">
              {perfil.entidades_principales.map((entidad) => (
                <li key={entidad.clave}>
                  <span>{entidad.nombre}</span>
                  <span>{formatearPorcentaje(entidad.pct)}</span>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <section>
          <h3>Cómo votan</h3>
          <p>{perfil.como_votan}</p>
          <FiguraDeDatos {...trayectoria} />
        </section>

        <section>
          <h3>Elección judicial 2025</h3>
          <TablaDeDatos tabla={tablaDeJudicial(perfil, nacional)} />
        </section>

        <section>
          <h3>Lectura (hipótesis)</h3>
          <p>{perfil.lectura}</p>
        </section>

        <section>
          <h3>Objetivo y estrategias</h3>
          <p>{perfil.objetivo}</p>
          <ol className="ficha__estrategias">
            {perfil.estrategias.map(({ estrategia, canal, indicador }) => (
              <li key={estrategia}>
                <strong>{estrategia}</strong>
                <p>Canal y momento: {canal}</p>
                <p>Indicador: {indicador}</p>
              </li>
            ))}
          </ol>
        </section>

        <p className="ficha__fuente">
          Fuente: INE, Conteos Censales de Participación Ciudadana; perfiles y estrategias del equipo Utrinos.
        </p>
      </div>
    </dialog>
  )
}
