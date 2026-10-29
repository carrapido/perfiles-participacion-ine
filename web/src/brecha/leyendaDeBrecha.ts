import { BRECHA_MAXIMA, colorDeBrecha } from './colorDeBrecha.ts'

// De izquierda a derecha: de +20 (las mujeres votan más) a −20 (los hombres votan más), igual que en el mapa
const PARADAS = [1, 0.75, 0.5, 0.25, 0, -0.25, -0.5, -0.75, -1].map((fraccion) => fraccion * BRECHA_MAXIMA)

export function degradadoDeBrecha(): string {
  return `linear-gradient(to right, ${PARADAS.map((brecha) => colorDeBrecha(brecha)).join(', ')})`
}
