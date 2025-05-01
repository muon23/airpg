from fastapi import APIRouter, HTTPException
from typing import List
from ..models.response import EngineResponse

router = APIRouter()

@router.get("/engines", response_model=List[EngineResponse])
async def get_engines():
    """
    Get list of available AI engines
    """
    try:
        return [
            {
                "id": "gpt-4",
                "name": "GPT-4",
                "provider": "OpenAI",
                "version": "4.0"
            },
            {
                "id": "claude-3",
                "name": "Claude 3",
                "provider": "Anthropic",
                "version": "3.0"
            }
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
