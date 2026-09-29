from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class DecisionBase(BaseModel):
    title: str
    description: Optional[str] = None
    status: Optional[str] = "Draft"
    owner: Optional[str] = None
    tags: Optional[str] = None

class DecisionCreate(DecisionBase):
    pass

class DecisionResponse(DecisionBase):
    id: int
    expected_value: Optional[float] = None
    downside_probability: Optional[float] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
