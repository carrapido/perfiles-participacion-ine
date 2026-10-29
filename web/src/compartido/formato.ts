// signDisplay 'exceptZero' redondea antes de decidir el signo: -0.04 se muestra como 0.0, no como -0.0
const UN_DECIMAL_CON_SIGNO = new Intl.NumberFormat('es-MX', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
  signDisplay: 'exceptZero',
})

/** El único lugar donde se redondea la brecha: los JSON traen el valor exacto (resume.md, sección 6). */
export function formatearBrecha(brecha: number | null): string {
  return brecha === null ? 'sin datos' : `${UN_DECIMAL_CON_SIGNO.format(brecha)} puntos`
}
