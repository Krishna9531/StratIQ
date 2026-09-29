from sqlalchemy import Column, Integer, String, Float, DateTime, Enum
from sqlalchemy.sql import func
import enum
from app.core.database import Base

class DecisionStatus(str, enum.Enum):
    DRAFT = "Draft"
    ACTIVE = "Active"
    IN_REVIEW = "In Review"
    COMPLETED = "Completed"
    ARCHIVED = "Archived"

class Decision(Base):
    __tablename__ = "decisions"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    description = Column(String, nullable=True)
    status = Column(String, default=DecisionStatus.DRAFT.value)
    
    # Outcomes
    expected_value = Column(Float, nullable=True)
    downside_probability = Column(Float, nullable=True)
    
    # Metadata
    owner = Column(String, nullable=True)
    tags = Column(String, nullable=True) # Comma separated for simplicity in SQLite
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
