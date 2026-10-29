import { useMemo } from 'react'
import { claveDeMunicipio, type DatosDelMapa, type Municipio } from '../datos/datosDelMapa.ts'
import type { BuscadorDeNombres } from '../datos/nombres.ts'
import { PerfilesPrincipales } from '../perfiles/PerfilesPrincipales.tsx'
import type { NivelDeZoom } from '../territorio/nivelDeZoom.ts'
import { NOMBRE_DEL_PAIS } from '../territorio/ruta.ts'
import { figurasDel } from './figuras.ts'
import { PanelVista } from './PanelVista.tsx'

interface Props {
  datos: DatosDelMapa
  nivelDeZoom: NivelDeZoom
  nombres: BuscadorDeNombres
  alAbrirFicha: (idDelPerfil: string) => void
}

/** Contenedor: decide qué lleva el panel en cada nivel de zoom; PanelVista solo lo dibuja. */
export function Panel({ datos, nivelDeZoom, nombres, alAbrirFicha }: Props) {
  const figuras = useMemo(() => figurasDel(nivelDeZoom, datos), [nivelDeZoom, datos])
  const municipio = nivelDeZoom.nivel === 'municipio' ? municipioDel(nivelDeZoom, datos.municipios) : undefined
  return (
    <PanelVista titulo={tituloDel(nivelDeZoom, nombres)} figuras={figuras}>
      {municipio && (
        <PerfilesPrincipales
          perfiles={datos.perfiles}
          principal={municipio.perfil_principal}
          sinPerfil={municipio.sin_perfil}
          alAbrirFicha={alAbrirFicha}
        />
      )}
    </PanelVista>
  )
}

// El municipio lleva el nombre de su entidad: muchas capitales se llaman como su estado
function tituloDel(nivelDeZoom: NivelDeZoom, { deEntidad, deMunicipio }: BuscadorDeNombres): string {
  switch (nivelDeZoom.nivel) {
    case 'nacional':
      return NOMBRE_DEL_PAIS
    case 'entidad':
      return deEntidad(nivelDeZoom.entidad)
    case 'municipio':
      return `${deMunicipio(nivelDeZoom.entidad, nivelDeZoom.municipio)}, ${deEntidad(nivelDeZoom.entidad)}`
  }
}

function municipioDel(clave: { entidad: number; municipio: number }, municipios: DatosDelMapa['municipios']): Municipio | undefined {
  return municipios.find((municipio) => claveDeMunicipio(municipio) === claveDeMunicipio(clave))
}
