import '../compartido/botones.css'
import { COLOR_SIN_DATOS } from '../compartido/colores.ts'
import '../compartido/leyenda.css'
import { sexoConArticulo } from '../compartido/sexoConArticulo.ts'
import type { Perfil, Sexo } from '../datos/datosDelMapa.ts'
import './LeyendaDePerfil.css'

interface Props {
  perfiles: readonly Perfil[]
  sexo: Sexo
  alAbrirFicha: (idDelPerfil: string) => void
}

export function LeyendaDePerfil({ perfiles, sexo, alAbrirFicha }: Props) {
  return (
    <div className="leyenda">
      <p className="leyenda__titulo">Perfil de {sexoConArticulo(sexo)} con más lista nominal 2024 en cada municipio</p>
      <p className="leyenda__ayuda">Elige un perfil para ver su ficha.</p>
      <ul className="leyenda__perfiles">
        {perfiles
          .filter((perfil) => perfil.sexo === sexo)
          .map((perfil) => (
            <li key={perfil.id}>
              <span className="leyenda__muestra" style={{ background: perfil.color }} />
              <button type="button" className="boton-enlace" onClick={() => alAbrirFicha(perfil.id)}>
                {perfil.nombre}
              </button>
            </li>
          ))}
        <li>
          <span className="leyenda__muestra" style={{ background: COLOR_SIN_DATOS }} />
          Sin perfil: municipios con poca lista nominal de {sexoConArticulo(sexo)} o sin datos de alguna elección
        </li>
      </ul>
    </div>
  )
}
