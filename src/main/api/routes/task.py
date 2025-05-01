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
                "description": "Summarize the story so far"
            },
            {
                "id": "propose-ideas",
                "name": "Propose Ideas",
                "description": "Propose new story ideas"
            },
            {
                "id": "refine",
                "name": "Refine",
                "description": "Refine and improve the story"
            }
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
