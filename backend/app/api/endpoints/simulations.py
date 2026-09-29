from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional
from app.services.simulation.engine import run_monte_carlo

router = APIRouter()

class Variable(BaseModel):
    name: str
    distribution: str
    value: Optional[float] = None
    mean: Optional[float] = None
    std_dev: Optional[float] = None
    min: Optional[float] = None
    max: Optional[float] = None
    mode: Optional[float] = None

class SimulationRequest(BaseModel):
    iterations: int = 10000
    variables: List[Variable]

@router.post("/run")
def run_simulation(request: SimulationRequest):
    # Convert Pydantic models to dicts for the engine
    variables_dict = [var.model_dump() for var in request.variables]
    
    # Run the simulation engine
    results = run_monte_carlo(iterations=request.iterations, variables=variables_dict)
    
    return {"message": "Simulation completed", "results": results}
