import { Suspense, use, useMemo, useState } from 'react'
import { LeyendaDeBrecha } from './brecha/LeyendaDeBrecha.tsx'
import { cargarDatosDelMapa, type DatosDelMapa } from './datos/datosDelMapa.ts'
import { buscadorDeNombres } from './datos/nombres.ts'
import { MapaMexico } from './territorio/MapaMexico.tsx'
import { NACIONAL, type NivelDeZoom } from './territorio/nivelDeZoom.ts'
import { Ruta } from './territorio/Ruta.tsx'
import { pasosDeLaRuta } from './territorio/ruta.ts'

// use() necesita la misma promesa en cada render: se crea una sola vez, antes del primer render
const cargaDelMapa = cargarDatosDelMapa()

// Hasta que exista el selector de elección, el mapa muestra la última federal
const ELECCION_INICIAL = 2024

export default function App() {
  return (
    <>
      <header>
        <h1>Perfiles de participación ciudadana</h1>
        <p>Equipo Utrinos: Jorge González Mollinedo y Brandon Campos Buendía</p>
      </header>
      <main>
        <Suspense fallback={<p>Cargando el mapa…</p>}>
          <Sitio />
        </Suspense>
      </main>
    </>
  )
}

function Sitio() {
  const carga = use(cargaDelMapa)
  if (carga.estado === 'fallida') return <p role="alert">No se pudo cargar el mapa: {carga.mensaje}</p>
  return <Explorador datos={carga.datos} />
}

function Explorador({ datos }: { datos: DatosDelMapa }) {
  const [nivelDeZoom, setNivelDeZoom] = useState<NivelDeZoom>(NACIONAL)
  const nombres = useMemo(() => buscadorDeNombres(datos), [datos])
  return (
    <>
      <Ruta pasos={pasosDeLaRuta(nivelDeZoom, nombres.deEntidad, nombres.deMunicipio)} alElegir={setNivelDeZoom} />
      <MapaMexico datos={datos} eleccion={ELECCION_INICIAL} nivelDeZoom={nivelDeZoom} alCambiarNivel={setNivelDeZoom}>
        <LeyendaDeBrecha />
      </MapaMexico>
    </>
  )
}
