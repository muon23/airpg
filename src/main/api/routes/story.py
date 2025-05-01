from fastapi import APIRouter, HTTPException
from typing import List
from ..models.request import StoryRequest
from ..models.response import StoryResponse
import json

router = APIRouter()

@router.post("/story/generate", response_model=StoryResponse)
async def generate_story(request: StoryRequest):
    """
    Generate AI response based on story context
    """
    try:
        # Convert request to dict and then to pretty-printed JSON
        request_dict = request.dict()
        pretty_json = json.dumps(request_dict, indent=2)
        
        return {
            "content": f"Request received:\n{pretty_json}",
            "metadata": {
                "engine": request.engine,
                "task": request.task,
                "timestamp": "2024-03-21T12:00:00Z",
                "model_version": "1.0"
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
