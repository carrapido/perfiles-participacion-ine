import { claveDeMunicipio, type DatosDelMapa } from './datosDelMapa.ts'

export interface BuscadorDeNombres {
  deEntidad: (entidad: number) => string
  deMunicipio: (entidad: number, municipio: number) => string
}

export function buscadorDeNombres({ entidades, municipios }: Pick<DatosDelMapa, 'entidades' | 'municipios'>): BuscadorDeNombres {
  const entidadPorClave = new Map(entidades.map((entidad) => [entidad.clave, entidad.nombre]))
  const municipioPorClave = new Map(municipios.map((municipio) => [claveDeMunicipio(municipio), municipio.nombre]))
  return {
    deEntidad: (entidad) => entidadPorClave.get(entidad) ?? `Entidad ${entidad}`,
    deMunicipio: (entidad, municipio) => municipioPorClave.get(claveDeMunicipio({ entidad, municipio })) ?? `Municipio ${municipio}`,
  }
}
