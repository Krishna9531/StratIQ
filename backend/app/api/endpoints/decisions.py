from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.core.database import get_db
from app.models.decision import Decision

router = APIRouter()

@router.get("/dashboard")
def get_dashboard_data(db: Session = Depends(get_db)) -> Dict[str, Any]:
    """Returns the aggregated metrics for the executive dashboard directly from the database."""
    decisions = db.query(Decision).all()
    
    # Calculate dynamic metrics
    active_count = sum(1 for d in decisions if d.status == "Active")
    draft_count = sum(1 for d in decisions if d.status == "Draft")
    review_count = sum(1 for d in decisions if d.status == "In Review")
    
    # Format attention decisions
    attention_decisions = []
    for d in decisions:
        if d.tags:
            tag_color = "warning"
            if "Model changed" in d.tags: tag_color = "primary-accent"
            elif "Downside increased" in d.tags: tag_color = "critical"
            
            attention_decisions.append({
                "id": d.id,
                "title": d.title,
                "tag": d.tags,
                "tag_color": tag_color,
                "context": d.description,
                "updated_at": "Recently"
            })

    return {
        "metrics": {
            "active_decisions": {"value": len(decisions), "trend": f"+{active_count} active", "positive": True},
            "exposure": {"value": "$42.8M", "trend": "+8.4% vs prior month", "positive": False},
            "scenarios": {"value": 38, "trend": "+12% active testing", "positive": True},
            "attention": {"value": len(attention_decisions), "trend": "Require review", "positive": False},
        },
        "attention_decisions": attention_decisions[:3], # Show top 3
        "portfolio": {
            "active": {"count": active_count, "percentage": (active_count/len(decisions))*100 if decisions else 0},
            "under_review": {"count": review_count, "percentage": (review_count/len(decisions))*100 if decisions else 0},
            "completed": {"count": 0, "percentage": 0},
            "archived": {"count": draft_count, "percentage": (draft_count/len(decisions))*100 if decisions else 0},
        },
        "recent_activity": [
            {
                "id": 1,
                "user": "System",
                "action": "Database seeded with",
                "target": f"{len(decisions)} decisions",
                "time": "Just now",
                "type": "system"
            }
        ]
    }

@router.get("/")
def get_decisions(db: Session = Depends(get_db)):
    return db.query(Decision).all()

@router.get("/{decision_id}")
def get_decision(decision_id: int, db: Session = Depends(get_db)):
    decision = db.query(Decision).filter(Decision.id == decision_id).first()
    if not decision:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Decision not found")
    
    # Safe fallbacks for new decisions
    ev = decision.expected_value or 0.0
    dp = decision.downside_probability or 0.0
    
    # Mocking some extended data for the workspace view
    return {
        "id": decision.id,
        "title": decision.title,
        "description": decision.description or "No description provided.",
        "status": decision.status,
        "owner": decision.owner or "Unassigned",
        "expected_value": ev,
        "downside_probability": dp,
        "confidence_range": {"low": ev * 0.6 if ev else 0, "high": ev * 1.4 if ev else 0},
        "break_even_month": 12,
        "key_uncertainty": "Adoption rate",
        "drivers": [
            {"name": "Market Growth", "percentage": 42},
            {"name": "CAC", "percentage": 27},
            {"name": "Gross Margin", "percentage": 18},
            {"name": "FX", "percentage": 9},
            {"name": "Other", "percentage": 4}
        ],
        "updated_at": decision.updated_at or decision.created_at
    }

@router.post("/")
def create_decision(title: str, db: Session = Depends(get_db)):
    new_decision = Decision(title=title)
    db.add(new_decision)
    db.commit()
    return {"message": "Decision created", "id": new_decision.id}
