from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from .routes import engine, task, story

app = FastAPI(
    title="AI RPG API",
    description="API for AI-assisted story generation",
    version="0.1.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(engine.router, prefix="/api", tags=["engines"])
app.include_router(task.router, prefix="/api", tags=["tasks"])
app.include_router(story.router, prefix="/api", tags=["story"])

@app.get("/")
async def root():
    return {
        "message": "AI RPG API is running",
        "version": "0.1.0",
        "endpoints": {
            "engines": "/api/engines",
            "tasks": "/api/tasks",
            "story": "/api/story/generate"
        }
    }

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc)}
    )
