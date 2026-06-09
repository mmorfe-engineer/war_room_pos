import unittest
from pathlib import Path

from src.modelo_meridiano import (
    EstadoMeta,
    asignar_pos_agencias,
    calcular_cuotas_estado,
    ejecutar_modelo,
    parse_rent,
)


class ModeloMeridianoTests(unittest.TestCase):
    def test_parse_rent_formato_venezolano(self) -> None:
        self.assertEqual(parse_rent("1.234.567,89"), 1234567.89)
        self.assertEqual(parse_rent("12.000"), 12000.0)
        self.assertEqual(parse_rent(None), 0.0)

    def test_integridad_total_pos_2000(self) -> None:
        resumen = ejecutar_modelo(total_pos=2000)
        self.assertEqual(resumen["total_pos_objetivo"], 2000)

    def test_exclusion_rentabilidad_no_positiva(self) -> None:
        cuotas = calcular_cuotas_estado(
            [EstadoMeta(estado="Capital", meta_bdt=100, cumplimiento=0.0, factor_urgencia=1.0)],
            total_pos=200,
        )
        matriz = asignar_pos_agencias(
            [
                {"estado": "Capital", "region": "Capital Centro", "cod_agencia": "A1", "rentabilidad": "100"},
                {"estado": "Capital", "region": "Capital Centro", "cod_agencia": "A2", "rentabilidad": "0"},
            ],
            cuotas,
        )
        codigos = {fila["cod_agencia"] for fila in matriz}
        self.assertIn("A1", codigos)
        self.assertNotIn("A2", codigos)

    def test_docs_publico_no_tiene_bs(self) -> None:
        docs_index = Path(__file__).resolve().parents[1] / "docs" / "index.html"
        self.assertTrue(docs_index.exists())
        contenido = docs_index.read_text(encoding="utf-8")
        self.assertNotIn("Bs", contenido)


if __name__ == "__main__":
    unittest.main()
