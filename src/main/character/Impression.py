from typing import TypeVar

from character.Scene import Scene


class Impression:
    Character = TypeVar("Character")
    """ A conclusion of a scene from a Character """
    def __init__(
            self,
            creator: "Character",
            scene: Scene,
    ):
        self.creator = creator
        self.scene = scene
        self.impression = self.__make_impression()

    def __make_impression(self) -> str:
        pass

