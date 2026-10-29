import { describe, expect, it } from 'vitest'
import { COLOR_TEXTO } from './colores.ts'
import { colorDeTextoSobre } from './contraste.ts'

describe('colorDeTextoSobre', () => {
  it('usa blanco sobre un color oscuro', () => {
    expect(colorDeTextoSobre('#12366B')).toBe('#ffffff')
  })

  it('usa el color del texto sobre un color claro', () => {
    expect(colorDeTextoSobre('#1FB07A')).toBe(COLOR_TEXTO)
  })

  it('elige el de más contraste cuando los dos se acercan', () => {
    expect(colorDeTextoSobre('#2A78D6')).toBe('#ffffff') // 4.42 contra 3.94
    expect(colorDeTextoSobre('#D6517E')).toBe(COLOR_TEXTO) // 4.42 contra 3.93
  })
})
