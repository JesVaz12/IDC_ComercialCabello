# tests/test_hola.py
import unittest
from src.hola import hola_mundo

class TestHola(unittest.TestCase):
    def test_hola_mundo(self):
        self.assertEqual(hola_mundo(), "Hola Mundo")

if __name__ == "__main__":
    unittest.main()

