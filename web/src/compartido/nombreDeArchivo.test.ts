import { describe, expect, it } from 'vitest'
import { nombreDeArchivo } from './nombreDeArchivo.ts'

describe('nombreDeArchivo', () => {
  it('pasa el título a minúsculas y une las palabras con guiones', () => {
    expect(nombreDeArchivo('Ficha Mujeres urbanas en ascenso', 'png')).toBe('ficha-mujeres-urbanas-en-ascenso.png')
  })

  it('quita acentos, eñes y signos, que algunos sistemas no aceptan en un nombre de archivo', () => {
    expect(nombreDeArchivo('Ficha: Señales de acción, 2025', 'png')).toBe('ficha-senales-de-accion-2025.png')
  })
})
