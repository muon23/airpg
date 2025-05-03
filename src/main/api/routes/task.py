from fastapi import APIRouter, HTTPException
from typing import List
from ..models.response import TaskResponse

router = APIRouter()

@router.get("/tasks", response_model=List[TaskResponse])
async def get_tasks():
    """
    Get list of available tasks
    """
    try:
        return [
            {
                "id": "summarize",
                "name": "Summarize",
                "description": "Summarize the story so far",
                "borderColor": "#4CAF50"  # Green
            },
            {
                "id": "propose-ideas",
                "name": "Propose Ideas",
                "description": "Propose new story ideas",
                "borderColor": "#2196F3"  # Blue
            },
            {
                "id": "refine",
                "name": "Refine",
                "description": "Refine and improve the story",
                "borderColor": "#FF9800"  # Orange
            }
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
