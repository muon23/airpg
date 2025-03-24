import uuid
from typing import Collection, Sequence, TypeVar

from bots.Bot import Bot
from character.Impression import Impression
from character.Scene import Scene
from character.Situation import Situation


class Character:
    Character = TypeVar("Character")

    def __init__(
            self,
            name: str,                      # Name of the character
            engine: Bot,                    # Which AI model drives this character
            persona: str = None,            # Description of the persona
            where: str = None,              # Location where the character is currently at
            when: str = None,               # Time when the character is currently at
            **kwargs
    ):
        self.name = name
        self.engine = engine
        self.persona = persona
        self.where = where
        self.when = when

        self.id = uuid.uuid4()              # Unique ID

        self.experience: Sequence[Impression] = []
        self.current_scene: Scene | None = None

        self.default_max_new_tokens = kwargs.get("max_new_tokens", 200)
        self.default_max_experience = kwargs.get(
            "max_experience", engine.get_max_tokens() - 2 * self.default_max_new_tokens
        )

    def __eq__(self, other):
        return self.id == other.id

    def _get_persona_prompt(self) -> str:
        prompt = f"{self.name}: {self.persona}"

    def _get_experience_with(self, whom: Character, **kwargs) -> str:
        interactions = "\n\n".join([e.impression for e in self.experience if whom in e.scene.characters])

        # TODO: Summarize interactions if it exceeds token limit.  Save the summary somewhere
        max_tokens = kwargs.get("max_tokens", self.default_max_new_tokens)
        return interactions

    def play(
            self,
            counterparts: Collection[Character],
            recap: str,
            scene: Scene,
            **kwargs
    ) -> Situation:
        # Background prompt

        #

        # Experience of the character



        # TODO: Calculate token limits
        max_tokens_per_counterpart = -1

        experiences = {c: self._get_experience_with(c, max_tokens=max_tokens_per_counterpart) for c in counterparts}
        experience_prompt = "\n\n".join([
            f"{c.name}:\n{experiences[c]}"
            for c in experiences
        ])

        print(experience_prompt)

        response = self.engine.react(experience_prompt)
        print(response)

        return Situation.from_content(self, response["content"])

    def save(self, file_name: str):
        pass

    @classmethod
    def load(cls, file_name:str) -> Character:
        pass
