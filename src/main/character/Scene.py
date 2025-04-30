from dataclasses import dataclass
from typing import Collection, TypeVar, Sequence

from llms.Llm import Llm
from character.Situation import Situation


@dataclass
class Scene:
    Character = TypeVar("Character")

    characters: Collection[Character]
    situations: Sequence[Situation]

    @classmethod
    def new(cls, characters=Collection[Character]):
        return Scene(characters, [])

    def to_messages(self, protagonist: Character) -> Sequence[str]:
        user_messages = ""
        for s in self.situations:
            if s.Character == protagonist:
                if user_messages:
                    yield user_messages
                yield Llm.Role.AI, s.to_message()
            else:
                user_messages += s.to_message(private=False)
        if user_messages:
            yield user_messages




