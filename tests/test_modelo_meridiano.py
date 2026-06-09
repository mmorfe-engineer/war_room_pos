import unittest

from src.config import TOTAL_POS
from src.modelo_meridiano import construir_modelo
from src.utils import parse_rent


class TestModeloMeridiano(unittest.TestCase):
    def test_parse_rent_formato_venezolano(self):
        self.assertEqual(parse_rent('1.234.567,89'), 1234567.89)

    def test_total_pos(self):
        act, _ = construir_modelo()
        self.assertEqual(int(act['pos'].sum()), TOTAL_POS)


if __name__ == '__main__':
    unittest.main()
