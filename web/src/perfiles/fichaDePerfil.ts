import { baseDeGrafica, dosLineasConNombre } from '../compartido/baseDeGrafica.ts'
import { COLOR_CONTEXTO } from '../compartido/colores.ts'
import type { OpcionDeGrafica } from '../compartido/echarts.ts'
import type { Tabla } from '../compartido/TablaDeDatos.tsx'
import { formatearPorcentaje } from '../compartido/formato.ts'
import { sexoConArticulo } from '../compartido/sexoConArticulo.ts'
import type { Perfil, ResultadoPorSexo, Sexo } from '../datos/datosDelMapa.ts'
import { ELECCIONES_COMPARADAS, JUDICIAL, participacionFederal, ULTIMA_FEDERAL } from './validacionJudicial.ts'

type PerfilDeLaFicha = Pick<
  Perfil,
  'nombre' | 'sexo' | 'color' | 'pct_lista_nominal' | 'pct_de_su_sexo' | 'trayectoria' | 'judicial_2025'
>

const ESTE_PERFIL = 'Este perfil'
const TODO_SU_SEXO: Record<Sexo, string> = { mujeres: 'Todas las mujeres', hombres: 'Todos los hombres' }

export function pesoDelPerfil({ pct_lista_nominal, pct_de_su_sexo, sexo }: PerfilDeLaFicha): string {
  return `${formatearPorcentaje(pct_lista_nominal)} de la lista nominal 2024 y ${formatearPorcentaje(pct_de_su_sexo)} de ${sexoConArticulo(sexo)}`
}

/** Forma "emphasis": el perfil en su color y todo su sexo en gris de contexto. */
export function opcionDeTrayectoria(perfil: PerfilDeLaFicha, nacional: readonly ResultadoPorSexo[]): OpcionDeGrafica {
  const anios = perfil.trayectoria.map(({ anio }) => anio)
  const deSuSexo = anios.map((anio) => participacionDeSuSexo(nacional, anio, perfil.sexo))
  return {
    ...baseDeGrafica((valor) => formatearPorcentaje(valor)),
    grid: { top: 32, right: 120, bottom: 24, left: 44 },
    xAxis: { type: 'category', data: anios.map(String), boundaryGap: false },
    yAxis: { type: 'value', axisLabel: { formatter: '{value}%' } },
    series: dosLineasConNombre(
      { nombre: ESTE_PERFIL, datos: perfil.trayectoria.map(({ participacion }) => participacion), color: perfil.color },
      { nombre: TODO_SU_SEXO[perfil.sexo], datos: deSuSexo, color: COLOR_CONTEXTO },
    ),
  }
}

export function tablaDeTrayectoria(perfil: PerfilDeLaFicha, nacional: readonly ResultadoPorSexo[]): Tabla {
  return {
    columnas: ['Elección', ESTE_PERFIL, TODO_SU_SEXO[perfil.sexo]],
    filas: perfil.trayectoria.map(({ anio, participacion }) => [
      String(anio),
      formatearPorcentaje(participacion),
      formatearPorcentaje(participacionDeSuSexo(nacional, anio, perfil.sexo)),
    ]),
  }
}

export function tablaDeJudicial(perfil: PerfilDeLaFicha, nacional: readonly ResultadoPorSexo[]): Tabla {
  const [federal, judicial] = ELECCIONES_COMPARADAS
  return {
    columnas: ['Elección', ESTE_PERFIL, TODO_SU_SEXO[perfil.sexo]],
    filas: [
      [
        federal,
        formatearPorcentaje(participacionFederal(perfil)),
        formatearPorcentaje(participacionDeSuSexo(nacional, ULTIMA_FEDERAL, perfil.sexo)),
      ],
      [
        judicial,
        formatearPorcentaje(perfil.judicial_2025),
        formatearPorcentaje(participacionDeSuSexo(nacional, JUDICIAL, perfil.sexo)),
      ],
    ],
  }
}

function participacionDeSuSexo(nacional: readonly ResultadoPorSexo[], anio: number, sexo: Sexo): number | null {
  return nacional.find((eleccion) => eleccion.anio === anio)?.[sexo] ?? null
}
