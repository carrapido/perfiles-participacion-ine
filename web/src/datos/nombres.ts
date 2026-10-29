import { claveDeMunicipio, type Entidad, type Municipio } from './datosDelMapa.ts'

export interface BuscadorDeNombres {
  deEntidad: (entidad: number) => string
  deMunicipio: (entidad: number, municipio: number) => string
}

interface Nombres {
  entidades: readonly Pick<Entidad, 'clave' | 'nombre'>[]
  municipios: readonly Municipio[]
}

export function buscadorDeNombres({ entidades, municipios }: Nombres): BuscadorDeNombres {
  const entidadPorClave = new Map(entidades.map((entidad) => [entidad.clave, entidad.nombre]))
  const municipioPorClave = new Map(municipios.map((municipio) => [claveDeMunicipio(municipio), municipio.nombre]))
  return {
    deEntidad: (entidad) => entidadPorClave.get(entidad) ?? `Entidad ${entidad}`,
    deMunicipio: (entidad, municipio) => municipioPorClave.get(claveDeMunicipio({ entidad, municipio })) ?? `Municipio ${municipio}`,
  }
}
