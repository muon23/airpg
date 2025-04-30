import unittest

from llms.DeepInfraLlm import DeepInfraLlm
from character.Character import Character


class CharacterTest(unittest.TestCase):
    def test_basic(self):
        llama3 = DeepInfraLlm("llama-3")
        april = Character("April", engine=llama3)
        # april.play()
        self.assertEqual(True, False)  # add assertion here


if __name__ == '__main__':
    unittest.main()
