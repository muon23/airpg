from abc import ABC, abstractmethod
from typing import Collection, Dict, TypeVar

from character import Character


class Action(ABC):
    Action = TypeVar("Action")

    _actions: Dict[str, Action] = dict()

    def __init_subclass__(cls, **kwargs):
        super().__init_subclass__(**kwargs)
        action_name = cls.get_name()
        if action_name not in cls._actions:
            cls._actions[action_name] = cls

    @classmethod
    def of(cls, action_name: str) -> Action:
        return cls._actions.get(action_name)

    @classmethod
    @abstractmethod
    def get_name(cls) -> str:
        pass

    @abstractmethod
    def act(self, by: Character.Character, to: Collection[Character.Character] = None, **kwargs) -> None:
        pass
