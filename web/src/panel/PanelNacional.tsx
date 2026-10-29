import { useMemo } from 'react'
import { FiguraDeDatos } from '../compartido/FiguraDeDatos.tsx'
import type { DatosDelMapa } from '../datos/datosDelMapa.ts'
import {
  opcionDeBrechaPorEdad,
  opcionDeParticipacionPorSexo,
  opcionDeValidacionJudicial,
  tablaDeBrechaPorEdad,
  tablaDeParticipacionPorSexo,
  tablaDeValidacionJudicial,
} from './graficasNacionales.ts'
import './Panel.css'

const CLAVE_NACIONAL = 0 // en brecha_edad.json, el ámbito 0 es el total nacional

type DatosDelPanel = Pick<DatosDelMapa, 'nacional' | 'brechaPorEdad' | 'perfiles'>

export function PanelNacional({ datos }: { datos: DatosDelPanel }) {
  const figuras = useMemo(() => figurasNacionales(datos), [datos])
  return (
    <section className="panel" aria-labelledby="panel-titulo">
      <h2 id="panel-titulo" className="panel__titulo">
        México
      </h2>
      {figuras.map((figura) => (
        <FiguraDeDatos key={figura.titulo} {...figura} />
      ))}
    </section>
  )
}

function figurasNacionales({ nacional, brechaPorEdad, perfiles }: DatosDelPanel) {
  const curvas = brechaPorEdad.ambitos.find((ambito) => ambito.clave === CLAVE_NACIONAL)
  const grupos = brechaPorEdad.grupos_de_edad
  const porEdad = curvas
    ? [{ titulo: 'Brecha por edad, en puntos', opcion: opcionDeBrechaPorEdad(grupos, curvas), tabla: tablaDeBrechaPorEdad(grupos, curvas) }]
    : []
  return [
    {
      titulo: 'Participación por sexo en las elecciones federales',
      opcion: opcionDeParticipacionPorSexo(nacional),
      tabla: tablaDeParticipacionPorSexo(nacional),
    },
    ...porEdad,
    {
      titulo: 'Participación de cada perfil: federal 2024 y judicial 2025',
      opcion: opcionDeValidacionJudicial(perfiles),
      tabla: tablaDeValidacionJudicial(perfiles),
    },
  ]
}
