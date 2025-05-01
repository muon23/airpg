from pydantic import BaseModel
from typing import List, Optional

class Character(BaseModel):
    id: str
    name: str
    persona: str
    controlled_by: str  # 'user' or 'ai'

class World(BaseModel):
    id: str
    name: str
    description: str

class StoryPanel(BaseModel):
    user_input: str
    ai_output: str
    is_edited: bool
    section_instructions: str = ""  # Default to empty string if not provided

class StoryRequest(BaseModel):
    engine: str
    task: str
    world: World
    characters: List[Character]
    story_recap: str
    instructions: str
    current_panel_index: int
    panels: List[StoryPanel]
