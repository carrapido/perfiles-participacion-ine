import { ARRIBA_DE_CINCO_PERFILES, baseDeGrafica, dosLineasConNombre, linea } from '../compartido/baseDeGrafica.ts'
import { COLOR_CONTEXTO, COLOR_HOMBRES, COLOR_JUDICIAL, COLOR_MUJERES } from '../compartido/colores.ts'
import type { OpcionDeGrafica } from '../compartido/echarts.ts'
import type { Tabla } from '../compartido/TablaDeDatos.tsx'
import { formatearBrecha, formatearPorcentaje } from '../compartido/formato.ts'
import type { CurvasDeBrecha, Perfil, ResultadoPorSexo } from '../datos/datosDelMapa.ts'
import { ELECCIONES_COMPARADAS, participacionFederal } from '../perfiles/validacionJudicial.ts'

type PerfilParaValidar = Pick<Perfil, 'nombre' | 'color' | 'trayectoria' | 'judicial_2025'>

export function opcionDeParticipacionPorSexo(nacional: readonly ResultadoPorSexo[]): OpcionDeGrafica {
  const federales = soloFederales(nacional)
  return {
    ...baseDeGrafica((valor) => formatearPorcentaje(valor, 2)),
    grid: { top: 32, right: 72, bottom: 24, left: 44 },
    xAxis: { type: 'category', data: federales.map(({ anio }) => String(anio)), boundaryGap: false },
    yAxis: { type: 'value', axisLabel: { formatter: '{value}%' } },
    series: dosLineasConNombre(
      { nombre: 'Mujeres', datos: federales.map(({ mujeres }) => mujeres), color: COLOR_MUJERES },
      { nombre: 'Hombres', datos: federales.map(({ hombres }) => hombres), color: COLOR_HOMBRES },
    ),
  }
}

export function tablaDeParticipacionPorSexo(nacional: readonly ResultadoPorSexo[]): Tabla {
  return {
    columnas: ['Elección', 'Mujeres', 'Hombres', 'Brecha'],
    filas: soloFederales(nacional).map(({ anio, mujeres, hombres, brecha }) => [
      String(anio),
      formatearPorcentaje(mujeres, 2),
      formatearPorcentaje(hombres, 2),
      formatearBrecha(brecha, 2),
    ]),
  }
}

export function opcionDeBrechaPorEdad(grupos: readonly string[], curvas: CurvasDeBrecha): OpcionDeGrafica {
  return {
    ...baseDeGrafica((valor) => formatearBrecha(valor)),
    grid: { top: 32, right: 96, bottom: 24, left: 36 },
    // onZero false: con brechas negativas, las etiquetas de edad se quedan abajo y no cruzan las líneas
    xAxis: { type: 'category', data: [...grupos], boundaryGap: false, axisLine: { onZero: false } },
    yAxis: { type: 'value' },
    series: dosLineasConNombre(
      { nombre: 'Federal 2024', datos: curvas.federal_2024, color: COLOR_CONTEXTO },
      { nombre: 'Judicial 2025', datos: curvas.judicial_2025 ?? [], color: COLOR_JUDICIAL },
    ),
  }
}

export function tablaDeBrechaPorEdad(grupos: readonly string[], curvas: CurvasDeBrecha): Tabla {
  return {
    columnas: ['Edad', ...ELECCIONES_COMPARADAS],
    filas: grupos.map((grupo, posicion) => [
      grupo,
      formatearBrecha(curvas.federal_2024[posicion] ?? null),
      formatearBrecha(curvas.judicial_2025?.[posicion] ?? null),
    ]),
  }
}

/** Cinco series: van con leyenda y tabla; sus nombres son largos para etiquetarlos al final de cada línea. */
export function opcionDeValidacionJudicial(perfiles: readonly PerfilParaValidar[]): OpcionDeGrafica {
  return {
    ...baseDeGrafica((valor) => formatearPorcentaje(valor)),
    grid: { top: ARRIBA_DE_CINCO_PERFILES, right: 16, bottom: 24, left: 44 },
    xAxis: { type: 'category', data: [...ELECCIONES_COMPARADAS] },
    yAxis: { type: 'value', axisLabel: { formatter: '{value}%' } },
    series: perfiles.map((perfil) => linea(perfil.nombre, [participacionFederal(perfil), perfil.judicial_2025], perfil.color)),
  }
}

export function tablaDeValidacionJudicial(perfiles: readonly PerfilParaValidar[]): Tabla {
  return {
    columnas: ['Perfil', ...ELECCIONES_COMPARADAS],
    filas: perfiles.map((perfil) => [
      perfil.nombre,
      formatearPorcentaje(participacionFederal(perfil)),
      formatearPorcentaje(perfil.judicial_2025),
    ]),
  }
}

function soloFederales(nacional: readonly ResultadoPorSexo[]): ResultadoPorSexo[] {
  return nacional.filter((eleccion) => eleccion.tipo === 'federal')
}
