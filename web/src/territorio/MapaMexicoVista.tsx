import type { ReactNode, RefObject } from 'react'
import { LIENZO, type MunicipioColoreado } from './geometriaDelMapa.ts'
import type { Resaltes } from './resaltes.ts'
import './MapaMexico.css'

interface Props {
  lienzoRef: RefObject<SVGSVGElement | null>
  capaRef: RefObject<SVGGElement | null>
  descripcion: string
  municipios: MunicipioColoreado[]
  bordesDeEntidad: string
  resaltes: Resaltes
  alHacerClicEnFondo: () => void
  alHacerClicEnMunicipio: (entidad: number, municipio: number) => void
  children?: ReactNode
}

export function MapaMexicoVista({
  lienzoRef,
  capaRef,
  descripcion,
  municipios,
  bordesDeEntidad,
  resaltes,
  alHacerClicEnFondo,
  alHacerClicEnMunicipio,
  children,
}: Props) {
  return (
    <figure className="mapa">
      <svg
        ref={lienzoRef}
        className="mapa__lienzo"
        viewBox={`0 0 ${LIENZO.ancho} ${LIENZO.alto}`}
        aria-label={descripcion}
      >
        <rect className="mapa__fondo" width={LIENZO.ancho} height={LIENZO.alto} onClick={alHacerClicEnFondo} />
        <g ref={capaRef}>
          {municipios.map((municipio) => (
            <path
              key={`${municipio.entidad}-${municipio.municipio}`}
              className="mapa__municipio"
              d={municipio.trazo}
              fill={municipio.color}
              onClick={() => alHacerClicEnMunicipio(municipio.entidad, municipio.municipio)}
            >
              <title>{municipio.descripcion}</title>
            </path>
          ))}
          <path className="mapa__bordes" d={bordesDeEntidad} />
          {resaltes.entidad && <path className="mapa__entidad-enfocada" d={resaltes.entidad} />}
          {resaltes.municipio && (
            <>
              <path className="mapa__halo" d={resaltes.municipio} />
              <path className="mapa__municipio-elegido" d={resaltes.municipio} />
            </>
          )}
        </g>
      </svg>
      {children}
      <figcaption className="mapa__fuente">
        Fuente: INE, Conteos Censales de Participación Ciudadana; Marco Geográfico Seccional (geometría simplificada).
      </figcaption>
    </figure>
  )
}
