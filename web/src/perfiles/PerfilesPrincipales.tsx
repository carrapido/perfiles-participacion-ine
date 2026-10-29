import { COLOR_SIN_DATOS } from '../compartido/colores.ts'
import '../compartido/leyenda.css'
import { sexoConArticulo } from '../compartido/sexoConArticulo.ts'
import { SEXOS, type Perfil, type PerfilPrincipal } from '../datos/datosDelMapa.ts'
import './LeyendaDePerfil.css'

interface Props {
  perfiles: readonly Perfil[]
  principal: PerfilPrincipal | null // null: el modelo no tiene celdas en el municipio
}

/** El perfil de cada sexo con más lista nominal 2024 en el municipio: el mismo color que tiene en la capa de perfiles. */
export function PerfilesPrincipales({ perfiles, principal }: Props) {
  return (
    <section className="perfiles-principales">
      <h3 className="perfiles-principales__titulo">Perfil principal</h3>
      <p className="perfiles-principales__nota">El de cada sexo con más lista nominal 2024 en el municipio.</p>
      <ul className="leyenda__perfiles">
        {SEXOS.map((sexo) => {
          const perfil = perfiles.find((candidato) => candidato.id === principal?.[sexo])
          return (
            <li key={sexo}>
              <span className="leyenda__muestra" style={{ background: perfil?.color ?? COLOR_SIN_DATOS }} />
              {perfil?.nombre ?? `Sin perfil: el modelo no tiene celdas de ${sexoConArticulo(sexo)} en este municipio`}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
