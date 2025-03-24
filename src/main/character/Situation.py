import re
from dataclasses import dataclass
from enum import Enum
from typing import Sequence, TypeVar, Tuple


@dataclass
class Situation:
    Character = TypeVar("Character")

    class LineType(Enum):
        DESCRIPTION = 0
        DIALOG = 1
        THOUGHT = 2
        ACTION = 3

    created_by: Character  # Character who created this situation
    created_time: str  # Time of the story in a format that can be sorted chronologically
    lines: Sequence[Tuple[LineType, str]]  # Lines to describe the situation

    def __line2msg(self, line: Tuple[LineType, str], private: bool) -> str:

        if line[0] == self.LineType.DESCRIPTION:
            return line[1]
        elif line[0] == self.LineType.DIALOG:
            return f"{self.created_by.name}: \"{line[1]}\""
        elif line[0] == self.LineType.THOUGHT:
            return f"[{line[1]}]" if private else None
        else:  # Actions
            # TODO: How to handle actions?
            raise f"<{line[1]}>"

    def to_message(self, private: bool = True) -> str:
        return "\n".join([self.__line2msg(line, private) for line in self.lines if line])

    @classmethod
    def from_content(cls, creator: Character, content: str, creat_time: str = "") -> "Situation":
        # Define a regex pattern to match quoted substrings and plain text
        # TODO: How to parse actions?
        pattern = r'"([^"\[]*?)(?:"|\[|$)|\[([^\]]*?)(?:\]|$)'

        # Initialize the result list
        result = []
        last_end = 0  # Track the end of the last match to find DESCRIPTION

        matches = re.finditer(pattern, content, re.DOTALL)

        for match in matches:
            start, end = match.span()  # Get the start and end of the current match

            # If there's text between the last match and the current match, it's DESCRIPTION
            if last_end < start:
                description = content[last_end:start].strip()
                if description:  # Ignore empty or whitespace-only text
                    result.append((cls.LineType.DESCRIPTION, description))

            # Check which group matched
            if match.group(1) is not None:  # If it's a DIALOG
                result.append((cls.LineType.DIALOG, match.group(1).strip()))
            elif match.group(2) is not None:  # If it's a THOUGHT
                result.append((cls.LineType.THOUGHT, match.group(2).strip()))

            # Update the last_end to the end of the current match
            last_end = end

        # If there's remaining text after the last match, it's DESCRIPTION
        if last_end < len(content):
            description = content[last_end:].strip()
            if description:  # Ignore empty or whitespace-only text
                result.append((cls.LineType.DESCRIPTION, description))

        return Situation(creator, creat_time, result)
