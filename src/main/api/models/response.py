from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class EngineResponse(BaseModel):
    id: str
    name: str
    provider: str
    version: str

class TaskResponse(BaseModel):
    id: str
    name: str
    description: str

class StoryResponse(BaseModel):
    content: str
    metadata: Dict[str, Any]
