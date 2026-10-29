import { COLOR_SIN_DATOS } from '../compartido/colores.ts'
import { claveDeMunicipio, type CausaSinPerfil, type Municipio, type Perfil, type Sexo } from '../datos/datosDelMapa.ts'
import type { MunicipioColoreado, MunicipioTrazado } from '../territorio/geometriaDelMapa.ts'
import { porQueNoTienePerfil } from './causaSinPerfil.ts'

interface DatosDeLaCapa {
  municipios: readonly Pick<Municipio, 'entidad' | 'municipio' | 'nombre' | 'perfil_principal' | 'sin_perfil'>[]
  perfiles: readonly Pick<Perfil, 'id' | 'nombre' | 'color'>[]
}

/** Pinta cada municipio con el color sólido de su perfil principal del sexo elegido; gris si no lo tiene. */
export function colorearPorPerfil(trazos: MunicipioTrazado[], { municipios, perfiles }: DatosDeLaCapa, sexo: Sexo): MunicipioColoreado[] {
  const municipioPorClave = new Map(municipios.map((municipio) => [claveDeMunicipio(municipio), municipio]))
  const perfilPorId = new Map(perfiles.map((perfil) => [perfil.id, perfil]))
  return trazos.map((trazo) => {
    const municipio = municipioPorClave.get(claveDeMunicipio(trazo))
    const idDelPerfil = municipio?.perfil_principal?.[sexo]
    const perfil = idDelPerfil ? perfilPorId.get(idDelPerfil) : undefined
    return {
      ...trazo,
      color: perfil?.color ?? COLOR_SIN_DATOS,
      descripcion: `${municipio?.nombre}: ${perfil?.nombre ?? sinPerfil(municipio?.sin_perfil?.[sexo])}`,
    }
  })
}

function sinPerfil(causa: CausaSinPerfil | undefined): string {
  return causa ? `sin perfil porque ${porQueNoTienePerfil(causa)}` : 'sin perfil'
}
