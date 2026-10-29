import { describe, expect, it } from 'vitest'
import { sexoConArticulo } from './sexoConArticulo.ts'

describe('sexoConArticulo', () => {
  it('concuerda el artículo con el sexo', () => {
    expect(sexoConArticulo('mujeres')).toBe('las mujeres')
    expect(sexoConArticulo('hombres')).toBe('los hombres')
  })
})
