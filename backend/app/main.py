from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.endpoints import decisions, simulations
from app.core.database import engine, Base
import app.models.decision

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="StratIQ API",
    description="Enterprise Decision Intelligence & Risk Platform",
    version="1.0.0",
)

# Configure CORS for the Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(decisions.router, prefix="/api/v1/decisions", tags=["Decisions"])
app.include_router(simulations.router, prefix="/api/v1/simulations", tags=["Simulations"])

@app.get("/")
def read_root():
    return {"message": "Welcome to the StratIQ API"}
