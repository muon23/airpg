import unittest

from bots.GptBot import GptBot
from character.Character import Character
from character.Situation import Situation


class SituationTest(unittest.TestCase):
    april_scene = """
    April stood in the quiet kitchen, staring at the mess on the counter. Flour dusted the surface, a cracked egg oozed onto the edge of the cutting board, and a bowl of half-mixed batter sat abandoned. She sighed, brushing a strand of hair out of her face.
    
    "This was supposed to be easy," she muttered, picking up the whisk and giving the batter a half-hearted stir. "How do people make it look so effortless in the videos?"
    
    [Maybe I should just give up. No one’s expecting me to bake anything anyway. But no, I said I’d do it. I can’t back out now.]
    
    She glanced at the recipe on her phone, squinting at the tiny text. "Add the eggs one at a time? Great. One’s already on the counter. Does that count?"
    
    [Why did I think this was a good idea? I could’ve just bought something from the store. But no, I had to prove I could do it myself.]
    
    April cracked another egg into the bowl, this time successfully, and stirred with more determination. "Okay, focus. You’ve got this. It’s just a cake. People bake cakes all the time."
    
    [If this turns out terrible, I’ll just say it’s rustic. That’s a thing, right? Rustic cakes?]
    
    She poured the batter into the pan, smoothing it out with a spatula. "There. That doesn’t look too bad. Now into the oven."
    
    As she slid the pan onto the rack and closed the oven door, she leaned against the counter, exhaling deeply. "Please don’t burn. Please don’t explode. Just... be edible."
    
    [If this works, I’m never baking again. Ever.]
    """

    def test_basic(self):
        gpt = GptBot()
        april = Character("April", gpt)
        s1 = Situation.from_content(april, self.april_scene)

        message = s1.to_message()
        msg_lines = message.split("\n")
        self.assertEqual(len(msg_lines), 16)  # add assertion here


if __name__ == '__main__':
    unittest.main()
