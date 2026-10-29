/** Nombre de archivo que acepta cualquier sistema: minúsculas sin acentos, palabras unidas con guiones. */
export function nombreDeArchivo(titulo: string, extension: string): string {
  const palabras = titulo
    .normalize('NFD') // separa cada letra de su acento o tilde: "ñ" queda como "n" + "◌̃"
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
  return `${palabras.join('-')}.${extension}`
}
