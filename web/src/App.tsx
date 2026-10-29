import { Suspense, use, useCallback, useMemo, useState } from 'react'
import { colorearPorBrecha } from './brecha/capaDeBrecha.ts'
import { LeyendaDeBrecha } from './brecha/LeyendaDeBrecha.tsx'
import { Selector } from './compartido/Selector.tsx'
import { sexoConArticulo } from './compartido/sexoConArticulo.ts'
import { cargarDatosDelMapa, type DatosDelMapa, type Sexo } from './datos/datosDelMapa.ts'
import { nombreDeEleccion, opcionesDeEleccion } from './datos/elecciones.ts'
import { buscadorDeNombres } from './datos/nombres.ts'
import { Panel } from './panel/Panel.tsx'
import { colorearPorPerfil } from './perfiles/capaDePerfil.ts'
import { LeyendaDePerfil } from './perfiles/LeyendaDePerfil.tsx'
import type { MunicipioTrazado } from './territorio/geometriaDelMapa.ts'
import { MapaMexico } from './territorio/MapaMexico.tsx'
import { NACIONAL, type NivelDeZoom } from './territorio/nivelDeZoom.ts'
import { Ruta } from './territorio/Ruta.tsx'
import { pasosDeLaRuta } from './territorio/ruta.ts'

// use() necesita la misma promesa en cada render: se crea una sola vez, antes del primer render
const cargaDelMapa = cargarDatosDelMapa()

// El sitio abre en la última federal; la judicial se compara contra ella
const ELECCION_INICIAL = 2024

type Capa = 'brecha' | 'perfil'

const OPCIONES_DE_CAPA = [
  { valor: 'brecha', etiqueta: 'Brecha mujeres − hombres' },
  { valor: 'perfil', etiqueta: 'Perfil principal' },
] as const

const OPCIONES_DE_SEXO = [
  { valor: 'mujeres', etiqueta: 'Mujeres' },
  { valor: 'hombres', etiqueta: 'Hombres' },
] as const

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
  const [capa, setCapa] = useState<Capa>('brecha')
  const [eleccion, setEleccion] = useState(ELECCION_INICIAL)
  const [sexo, setSexo] = useState<Sexo>('mujeres')
  const nombres = useMemo(() => buscadorDeNombres(datos), [datos])
  const colorear = useCallback(
    (trazos: MunicipioTrazado[]) =>
      capa === 'brecha' ? colorearPorBrecha(trazos, datos, eleccion) : colorearPorPerfil(trazos, datos, sexo),
    [capa, datos, eleccion, sexo],
  )
  const nombreDeLaEleccion = nombreDeEleccion(datos.nacional, eleccion)

  return (
    <div className="explorador">
      <div className="explorador__mapa">
        <div className="controles">
          <Selector leyenda="Capa" opciones={OPCIONES_DE_CAPA} valor={capa} alCambiar={setCapa} />
          {capa === 'brecha' ? (
            <Selector leyenda="Elección" opciones={opcionesDeEleccion(datos.nacional)} valor={eleccion} alCambiar={setEleccion} />
          ) : (
            <Selector leyenda="Sexo" opciones={OPCIONES_DE_SEXO} valor={sexo} alCambiar={setSexo} />
          )}
        </div>
        <Ruta pasos={pasosDeLaRuta(nivelDeZoom, nombres.deEntidad, nombres.deMunicipio)} alElegir={setNivelDeZoom} />
        <MapaMexico
          topologia={datos.topologia}
          colorear={colorear}
          descripcion={
            capa === 'brecha'
              ? `Mapa de México por municipio: brecha de participación entre mujeres y hombres en la ${nombreDeLaEleccion}`
              : `Mapa de México por municipio: perfil principal de ${sexoConArticulo(sexo)}`
          }
          nivelDeZoom={nivelDeZoom}
          alCambiarNivel={setNivelDeZoom}
        >
          {capa === 'brecha' ? (
            <LeyendaDeBrecha eleccion={nombreDeLaEleccion} />
          ) : (
            <LeyendaDePerfil perfiles={datos.perfiles} sexo={sexo} />
          )}
        </MapaMexico>
      </div>
      <Panel datos={datos} nivelDeZoom={nivelDeZoom} nombres={nombres} />
    </div>
  )
}
