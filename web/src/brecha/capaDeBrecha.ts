import { formatearBrecha } from '../compartido/formato.ts'
import { claveDeMunicipio, type DatosDelMapa } from '../datos/datosDelMapa.ts'
import type { MunicipioColoreado, MunicipioTrazado } from '../territorio/geometriaDelMapa.ts'
import { colorDeBrecha } from './colorDeBrecha.ts'

/** Une cada trazo con su municipio y le da el color y la descripción de su brecha en la elección elegida. */
export function colorearPorBrecha(
  trazos: MunicipioTrazado[],
  { elecciones, municipios }: Pick<DatosDelMapa, 'elecciones' | 'municipios'>,
  eleccion: number,
): MunicipioColoreado[] {
  const posicion = elecciones.indexOf(eleccion)
  const municipioPorClave = new Map(municipios.map((municipio) => [claveDeMunicipio(municipio), municipio]))
  return trazos.map((trazo) => {
    const municipio = municipioPorClave.get(claveDeMunicipio(trazo))
    const brecha = municipio?.brecha[posicion] ?? null
    return { ...trazo, color: colorDeBrecha(brecha), descripcion: `${municipio?.nombre}: ${formatearBrecha(brecha)}` }
  })
}
