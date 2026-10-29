"""El caso real que falló en Colab: la concentración de Mujeres urbanas en ascenso ponía a Ciudad de México (9) antes
que a Baja California (2), las dos con 100 %, y pandas 2.2 las ponía al revés. Un caso inventado no lo reproduce:
depende de cómo el quicksort de NumPy elige sus pivotes con estos valores."""
import pandas as pd

from segmentacion import concentracion_por_entidad

# % de las mujeres de cada entidad en el perfil, a un decimal; Colima (6) no tiene el perfil
MUJERES_URBANAS_EN_ASCENSO = {
    1: 87.7, 2: 100.0, 3: 68.1, 4: 1.7, 5: 62.6, 7: 65.7, 8: 98.3, 9: 100.0, 10: 66.7, 11: 32.3, 12: 50.8,
    13: 74.5, 14: 28.1, 15: 47.9, 16: 47.9, 17: 41.2, 18: 58.0, 19: 1.4, 20: 69.2, 21: 86.7, 22: 4.0, 23: 81.4,
    24: 7.8, 25: 77.2, 26: 6.2, 27: 47.0, 28: 63.3, 29: 97.4, 30: 46.7, 31: 26.4, 32: 45.9,
}


def test_la_concentracion_de_mujeres_urbanas_en_ascenso_desempata_por_clave():
    peso_del_sexo = pd.Series(100.0, index=range(1, 33))
    peso_del_grupo = pd.Series(MUJERES_URBANAS_EN_ASCENSO)
    assert concentracion_por_entidad(peso_del_grupo, peso_del_sexo) == "2:100%, 9:100%, 8:98%, 29:97%, 1:88%"
