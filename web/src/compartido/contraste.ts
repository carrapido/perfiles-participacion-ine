import { rgb } from 'd3'
import { COLOR_FONDO, COLOR_TEXTO } from './colores.ts'

/** Texto dentro de una marca de color: blanco o casi negro, el que más contraste (skill dataviz, marks-and-anatomy). */
export function colorDeTextoSobre(fondo: string): string {
  return contraste(fondo, COLOR_FONDO) >= contraste(fondo, COLOR_TEXTO) ? COLOR_FONDO : COLOR_TEXTO
}

// Razón de contraste de WCAG 2.2: https://www.w3.org/TR/WCAG22/#dfn-contrast-ratio
function contraste(colorA: string, colorB: string): number {
  const [clara, oscura] = [luminancia(colorA), luminancia(colorB)].sort((a, b) => b - a)
  return (clara + 0.05) / (oscura + 0.05)
}

// Luminancia relativa: https://www.w3.org/TR/WCAG22/#dfn-relative-luminance
function luminancia(color: string): number {
  const { r, g, b } = rgb(color)
  return 0.2126 * canalLineal(r) + 0.7152 * canalLineal(g) + 0.0722 * canalLineal(b)
}

function canalLineal(canal: number): number {
  const proporcion = canal / 255
  return proporcion <= 0.04045 ? proporcion / 12.92 : ((proporcion + 0.055) / 1.055) ** 2.4
}
