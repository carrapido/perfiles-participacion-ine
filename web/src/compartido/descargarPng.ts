import { COLOR_FONDO } from './colores.ts'

const ATRIBUTO_FUERA_DE_LA_IMAGEN = 'data-fuera-de-la-imagen'

/** Se esparce en un elemento que no debe salir en el PNG: botones y tablas desplegables, que en una imagen no sirven. */
export const FUERA_DE_LA_IMAGEN = { [ATRIBUTO_FUERA_DE_LA_IMAGEN]: '' }

const ESCALA = 3 // modern-screenshot: DPI = 96 × scale, así que 288 ppp, suficiente para imprimir

/** Dibuja el nodo en un PNG con modern-screenshot (https://github.com/qq15725/modern-screenshot) y lo descarga. */
export async function descargarPng(nodo: HTMLElement, nombreDelArchivo: string): Promise<void> {
  // import() dinámico: Vite lo separa en su propio archivo y solo se descarga la primera vez que alguien pide un PNG
  const { domToPng } = await import('modern-screenshot')
  const url = await domToPng(nodo, { scale: ESCALA, backgroundColor: COLOR_FONDO, filter: vaEnLaImagen })
  // El atributo download pide guardar el enlace como archivo: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/a#download
  const enlace = document.createElement('a')
  enlace.href = url
  enlace.download = nombreDelArchivo
  enlace.click()
}

// Excluir un nodo excluye también a sus hijos
function vaEnLaImagen(nodo: Node): boolean {
  return !(nodo instanceof Element && nodo.hasAttribute(ATRIBUTO_FUERA_DE_LA_IMAGEN))
}
