import { COLOR_SIN_DATOS } from '../compartido/colores.ts'
import '../compartido/leyenda.css'
import { sexoConArticulo } from '../compartido/sexoConArticulo.ts'
import type { Perfil, Sexo } from '../datos/datosDelMapa.ts'
import './LeyendaDePerfil.css'

interface Props {
  perfiles: Perfil[]
  sexo: Sexo
}

export function LeyendaDePerfil({ perfiles, sexo }: Props) {
  return (
    <div className="leyenda">
      <p className="leyenda__titulo">Perfil de {sexoConArticulo(sexo)} con más lista nominal 2024 en cada municipio</p>
      <ul className="leyenda__perfiles">
        {perfiles
          .filter((perfil) => perfil.sexo === sexo)
          .map((perfil) => (
            <li key={perfil.id}>
              <span className="leyenda__muestra" style={{ background: perfil.color }} />
              {perfil.nombre}
            </li>
          ))}
        <li>
          <span className="leyenda__muestra" style={{ background: COLOR_SIN_DATOS }} />
          Sin perfil: municipios sin celdas de {sexoConArticulo(sexo)} en el modelo
        </li>
      </ul>
    </div>
  )
}
