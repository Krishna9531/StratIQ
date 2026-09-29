from app.core.database import SessionLocal, Base, engine
from app.models.decision import Decision, DecisionStatus

def seed_db():
    print("Creating tables...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    # Check if we already have decisions
    if db.query(Decision).first():
        print("Database already seeded.")
        db.close()
        return

    print("Seeding initial StratIQ decisions...")
    
    decisions = [
        Decision(
            title="Market Expansion",
            description="Evaluate whether to enter the Southeast Asian enterprise market.",
            status=DecisionStatus.IN_REVIEW.value,
            expected_value=18400000,
            downside_probability=0.142,
            owner="Sarah Chen",
            tags="High uncertainty"
        ),
        Decision(
            title="Pricing Strategy",
            description="Review pricing for the new Enterprise Segment.",
            status=DecisionStatus.ACTIVE.value,
            expected_value=8500000,
            downside_probability=0.08,
            owner="Alex Rao",
            tags="Model changed"
        ),
        Decision(
            title="Supplier Consolidation",
            description="Consolidate suppliers for the main manufacturing plant.",
            status=DecisionStatus.ACTIVE.value,
            expected_value=12200000,
            downside_probability=0.31,
            owner="Sarah Chen",
            tags="Downside increased"
        ),
        Decision(
            title="Data Center Expansion",
            description="Expand compute capacity in EU-West.",
            status=DecisionStatus.DRAFT.value,
            expected_value=None,
            downside_probability=None,
            owner="Alex Rao",
            tags="Pending review"
        )
    ]
    
    db.add_all(decisions)
    db.commit()
    print("Database seeded successfully!")
    db.close()

if __name__ == "__main__":
    seed_db()
