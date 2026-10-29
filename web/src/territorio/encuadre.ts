/** Caja en píxeles con el formato de `path.bounds` de d3-geo: [[x0, y0], [x1, y1]]. */
export type Caja = [[number, number], [number, number]]

export interface Lienzo {
  ancho: number
  alto: number
}

/** Los mismos campos que `d3.ZoomTransform`: se aplica con `d3.zoomIdentity.translate(x, y).scale(k)`. */
export interface Transformacion {
  k: number
  x: number
  y: number
}

// La caja ocupa el 90 % del lado del lienzo que más la limita, como en https://gist.github.com/mbostock/4699541
const MARGEN = 0.9

/**
 * Escala y traslación que centran la caja en el lienzo.
 * La escala máxima se aplica aquí porque `zoom.transform` no respeta el `scaleExtent` de d3-zoom.
 */
export function encuadrar(caja: Caja, lienzo: Lienzo, escalaMaxima = Number.POSITIVE_INFINITY): Transformacion {
  const k = Math.min(escalaMaxima, escalaQueLlena(caja, lienzo))
  const [centroX, centroY] = centroDe(caja)
  return { k, x: lienzo.ancho / 2 - k * centroX, y: lienzo.alto / 2 - k * centroY }
}

function escalaQueLlena([[x0, y0], [x1, y1]]: Caja, lienzo: Lienzo): number {
  return MARGEN / Math.max((x1 - x0) / lienzo.ancho, (y1 - y0) / lienzo.alto)
}

function centroDe([[x0, y0], [x1, y1]]: Caja): [number, number] {
  return [(x0 + x1) / 2, (y0 + y1) / 2]
}
