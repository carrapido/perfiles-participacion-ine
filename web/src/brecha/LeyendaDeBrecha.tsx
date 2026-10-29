import { BRECHA_MAXIMA, COLOR_SIN_DATOS } from './colorDeBrecha.ts'
import { degradadoDeBrecha } from './leyendaDeBrecha.ts'
import './LeyendaDeBrecha.css'

// Las marcas van en valor absoluto: el lado del degradado ya dice quién vota más
const MARCAS = [`${BRECHA_MAXIMA}+`, `${BRECHA_MAXIMA / 2}`, '0', `${BRECHA_MAXIMA / 2}`, `${BRECHA_MAXIMA}+`]

export function LeyendaDeBrecha({ eleccion }: { eleccion: string }) {
  return (
    <div className="leyenda">
      <p className="leyenda__titulo">Brecha de participación entre mujeres y hombres en la {eleccion}, en puntos</p>
      <div className="leyenda__barra" style={{ background: degradadoDeBrecha() }} />
      <div className="leyenda__marcas" aria-hidden="true">
        {MARCAS.map((marca, posicion) => (
          <span key={posicion}>{marca}</span>
        ))}
      </div>
      <div className="leyenda__lados">
        <span>Las mujeres votan más</span>
        <span>Los hombres votan más</span>
      </div>
      <p className="leyenda__sin-datos">
        <span className="leyenda__muestra" style={{ background: COLOR_SIN_DATOS }} />
        Sin datos: municipios sin votos registrados en esa elección
      </p>
    </div>
  )
}
