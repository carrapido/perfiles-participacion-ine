import { select, zoom as crearZoom, zoomIdentity, type D3ZoomEvent, type ZoomBehavior, type ZoomTransform } from 'd3'
import { useEffect, useEffectEvent, useMemo, useRef, type ReactNode, type RefObject } from 'react'
import type { TopologiaDeMexico } from '../datos/datosDelMapa.ts'
import { encuadrar, type Caja } from './encuadre.ts'
import { LIENZO, prepararGeometria, type MunicipioColoreado, type MunicipioTrazado } from './geometriaDelMapa.ts'
import { MapaMexicoVista } from './MapaMexicoVista.tsx'
import { NACIONAL, alHacerClicEnMunicipio, entidadEnfocada, type NivelDeZoom } from './nivelDeZoom.ts'
import { resaltesDe } from './resaltes.ts'

// Sin tope, la Ciudad de México quedaría con un zoom de más de 50×
const ESCALA_MAXIMA = 40
const DURACION_DEL_ZOOM_MS = 750

type ZoomDelMapa = ZoomBehavior<SVGSVGElement, unknown>

interface Props {
  topologia: TopologiaDeMexico
  colorear: (trazos: MunicipioTrazado[]) => MunicipioColoreado[] // la capa visible decide los colores
  descripcion: string // qué muestra el mapa, para lectores de pantalla
  nivelDeZoom: NivelDeZoom
  alCambiarNivel: (nivelDeZoom: NivelDeZoom) => void
  children?: ReactNode // la leyenda de la capa, entre el mapa y su fuente
}

/** Contenedor: proyecta la geometría, aplica la capa y conecta d3-zoom con el nivel de zoom de la página. */
export function MapaMexico({ topologia, colorear, descripcion, nivelDeZoom, alCambiarNivel, children }: Props) {
  const lienzoRef = useRef<SVGSVGElement>(null)
  const capaRef = useRef<SVGGElement>(null)
  const geometria = useMemo(() => prepararGeometria(topologia), [topologia])
  const municipios = useMemo(() => colorear(geometria.municipios), [colorear, geometria])
  const resaltes = useMemo(() => resaltesDe(nivelDeZoom, geometria), [nivelDeZoom, geometria])
  const zoom = useZoom(lienzoRef, capaRef)
  useEncuadre(lienzoRef, zoom, geometria.cajaDeEntidad, entidadEnfocada(nivelDeZoom))
  useTecla('Escape', () => alCambiarNivel(NACIONAL))

  return (
    <MapaMexicoVista
      lienzoRef={lienzoRef}
      capaRef={capaRef}
      descripcion={descripcion}
      municipios={municipios}
      bordesDeEntidad={geometria.bordesDeEntidad}
      resaltes={resaltes}
      alHacerClicEnFondo={() => alCambiarNivel(NACIONAL)}
      alHacerClicEnMunicipio={(entidad, municipio) => alCambiarNivel(alHacerClicEnMunicipio(nivelDeZoom, entidad, municipio))}
    >
      {children}
    </MapaMexicoVista>
  )
}

/** d3-zoom escribe el transform directo en el <g>: React no vuelve a dibujar 2,477 municipios en cada cuadro. */
function useZoom(lienzoRef: RefObject<SVGSVGElement | null>, capaRef: RefObject<SVGGElement | null>): ZoomDelMapa {
  const zoom = useMemo(() => crearZoom<SVGSVGElement, unknown>().scaleExtent([1, ESCALA_MAXIMA]), [])
  useEffect(() => {
    const lienzo = lienzoRef.current
    const capa = capaRef.current
    if (!lienzo || !capa) return
    zoom.on('zoom', ({ transform }: D3ZoomEvent<SVGSVGElement, unknown>) => {
      capa.setAttribute('transform', transform.toString())
    })
    const seleccion = select(lienzo).call(zoom)
    return () => {
      seleccion.on('.zoom', null)
    }
  }, [lienzoRef, capaRef, zoom])
  return zoom
}

/** Anima el zoom cada vez que cambia la entidad enfocada; elegir un municipio de la misma entidad no lo mueve. */
function useEncuadre(
  lienzoRef: RefObject<SVGSVGElement | null>,
  zoom: ZoomDelMapa,
  cajaDeEntidad: Map<number, Caja>,
  entidad: number | null,
) {
  useEffect(() => {
    const lienzo = lienzoRef.current
    if (!lienzo) return
    select(lienzo).transition().duration(DURACION_DEL_ZOOM_MS).call(zoom.transform, transformacionPara(entidad, cajaDeEntidad))
  }, [lienzoRef, zoom, cajaDeEntidad, entidad])
}

function transformacionPara(entidad: number | null, cajaDeEntidad: Map<number, Caja>): ZoomTransform {
  const caja = entidad === null ? undefined : cajaDeEntidad.get(entidad)
  if (!caja) return zoomIdentity
  const { k, x, y } = encuadrar(caja, LIENZO, ESCALA_MAXIMA)
  return zoomIdentity.translate(x, y).scale(k)
}

function useTecla(tecla: string, alPresionar: () => void) {
  const alPresionarTecla = useEffectEvent((evento: KeyboardEvent) => {
    if (evento.key === tecla) alPresionar()
  })
  useEffect(() => {
    const escuchar = (evento: KeyboardEvent) => alPresionarTecla(evento)
    window.addEventListener('keydown', escuchar)
    return () => window.removeEventListener('keydown', escuchar)
  }, [])
}
