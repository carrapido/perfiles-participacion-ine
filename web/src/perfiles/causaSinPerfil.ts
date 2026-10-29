import type { CausaSinPerfil } from '../datos/datosDelMapa.ts'

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/ListFormat
const LISTA_EN_ESPANOL = new Intl.ListFormat('es', { type: 'conjunction' })

/** Por qué un municipio no tiene perfil de un sexo, como lo dicen el tooltip del mapa y el panel del municipio. */
export function porQueNoTienePerfil(causa: CausaSinPerfil): string {
  switch (causa.causa) {
    case 'lista_nominal_chica':
      return `ningún grupo de edad llega a ${causa.minima} personas en la lista nominal en todas las elecciones`
    case 'sin_conteo':
      return `los conteos censales no tienen datos de participación de ${enLista(causa.elecciones)}`
    case 'fuera_de_los_conteos':
      return `el municipio no aparece en los conteos censales de ${enLista(causa.elecciones)}`
  }
}

function enLista(elecciones: readonly number[]): string {
  return LISTA_EN_ESPANOL.format(elecciones.map(String))
}
