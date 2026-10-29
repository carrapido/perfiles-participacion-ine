import { describe, expect, it } from 'vitest'
import { encuadrar, type Caja } from './encuadre.ts'

const LIENZO = { ancho: 800, alto: 600 }

describe('encuadrar', () => {
  it('lleva el centro de la caja al centro del lienzo', () => {
    const caja: Caja = [[100, 100], [300, 150]]
    const { k, x, y } = encuadrar(caja, LIENZO)
    expect(k * 200 + x).toBeCloseTo(400)
    expect(k * 125 + y).toBeCloseTo(300)
  })

  it('en una caja apaisada escala por el ancho, que es el lado que más limita', () => {
    // 200 px son 0.25 del ancho; 50 px son 0.08 del alto
    expect(encuadrar([[100, 100], [300, 150]], LIENZO).k).toBeCloseTo(0.9 / 0.25)
  })

  it('en una caja vertical escala por el alto, que es el lado que más limita', () => {
    // 60 px son 0.075 del ancho; 300 px son 0.5 del alto
    expect(encuadrar([[0, 0], [60, 300]], LIENZO).k).toBeCloseTo(0.9 / 0.5)
  })

  it('no pasa de la escala máxima y sigue centrando la caja', () => {
    const entidadDiminuta: Caja = [[400, 300], [404, 303]]
    const { k, x, y } = encuadrar(entidadDiminuta, LIENZO, 8)
    expect(k).toBe(8)
    expect(k * 402 + x).toBeCloseTo(400)
    expect(k * 301.5 + y).toBeCloseTo(300)
  })
})
