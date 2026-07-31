from fastapi import FastAPI

from app.api.tools import router as tools_router
from app.api.vapi import router as internal_router
from app.core.config import settings


app = FastAPI(
    title="Patient Registration AI Service",
    version="1.0.0",
)


app.include_router(internal_router)
app.include_router(tools_router)


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "ai-service",
        "environment": settings.app_env,
    }