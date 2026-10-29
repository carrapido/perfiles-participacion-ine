// Los JSON traen el valor exacto: aquí se redondea, una sola vez, al mostrarlo (resume.md, sección 6)
const formateadores = new Map<string, Intl.NumberFormat>()

export function formatearPorcentaje(valor: number | null, decimales = 1): string {
  return valor === null ? 'sin datos' : `${formateador(decimales, false).format(valor)}%`
}

export function formatearBrecha(brecha: number | null, decimales = 1): string {
  return brecha === null ? 'sin datos' : `${formateador(decimales, true).format(brecha)} puntos`
}

// signDisplay 'exceptZero' redondea antes de decidir el signo: -0.04 se muestra como 0.0, no como -0.0
function formateador(decimales: number, conSigno: boolean): Intl.NumberFormat {
  const clave = `${decimales}-${conSigno}`
  const existente = formateadores.get(clave)
  if (existente) return existente
  const nuevo = new Intl.NumberFormat('es-MX', {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
    signDisplay: conSigno ? 'exceptZero' : 'auto',
  })
  formateadores.set(clave, nuevo)
  return nuevo
}
