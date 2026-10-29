"""Cuando varias entidades empatan, van de menor a mayor clave, sin importar la versión de pandas.
sort_values ordena por omisión con quicksort, que no es estable: pandas 3.1 ponía Ciudad de México antes que
Baja California (las dos con 100 % en Mujeres urbanas en ascenso) y pandas 2.2, el de Colab, al revés.
Tres empates en un orden que ni el original ni su inverso dejan bien: solo pasa un desempate por clave."""
import pandas as pd

from exportar_web import entidades_principales
from segmentacion import concentracion_por_entidad

EMPATADAS = [9, 2, 5]  # claves de entidad, todas con el mismo porcentaje


def test_las_entidades_principales_de_un_perfil_desempatan_por_clave():
    indice = pd.MultiIndex.from_tuples([(clave, 1, "mujeres_1") for clave in [*EMPATADAS, 8]],
                                       names=["EDOCVE", "SEXO", "perfil_sexo"])
    reparto = pd.Series([100.0, 100.0, 100.0, 90.0], index=indice)
    assert [entidad["clave"] for entidad in entidades_principales(reparto, "mujeres_1")] == [2, 5, 9, 8]


def test_la_concentracion_por_entidad_desempata_por_clave():
    peso_del_sexo = pd.Series(10, index=[*EMPATADAS, 8])
    peso_del_grupo = pd.Series([10, 10, 10, 9], index=[*EMPATADAS, 8])
    assert concentracion_por_entidad(peso_del_grupo, peso_del_sexo) == "2:100%, 5:100%, 9:100%, 8:90%"
