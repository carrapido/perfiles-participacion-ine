// Un solo gris para "sin datos" (brecha) y "sin perfil" (perfiles): en las dos capas significa que no hay valor
export const COLOR_SIN_DATOS = '#b8b8b8'

// Los mismos valores que las variables de index.css: ECharts dibuja con hex, no lee variables CSS
export const COLOR_FONDO = '#ffffff'
export const COLOR_TEXTO = '#1a1a1a'
export const COLOR_TEXTO_SECUNDARIO = '#52514e'
export const COLOR_REJILLA = '#ecebe8'

// Polos de PuOr, como en el mapa: morado = mujeres, naranja café = hombres. Validados con el script de la skill
// dataviz (ΔE 27 con visión normal, 24.9 con protanopia)
export const COLOR_MUJERES = '#5e3c99'
export const COLOR_HOMBRES = '#b35806'

// Forma "emphasis": la judicial resaltada y la federal 2024 en gris de contexto
export const COLOR_JUDICIAL = '#008300'
export const COLOR_CONTEXTO = '#8a8984'

// Forma "emphasis" del municipio elegido: casi negro, como su contorno en el mapa, y su entidad en el gris de contexto.
// Sin tono a propósito: los tonos ya nombran a los sexos, a la judicial y a los cinco perfiles. El validador de la skill
// dataviz pasa la separación (ΔE 41) y el contraste; sus pruebas de banda y croma son para paletas categóricas
export const COLOR_MUNICIPIO = COLOR_TEXTO
