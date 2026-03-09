"""
Memory Management API — Allows the frontend to view, add, and delete
long-term memory facts and user preferences.
"""
from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from brain.service import pm  # singleton PersistentMemory instance

router = APIRouter()


class FactBody(BaseModel):
    fact: str


class PreferenceBody(BaseModel):
    key: str
    value: str


class PreferenceKeyBody(BaseModel):
    key: str


# ── READ ─────────────────────────────────────────────
@router.get("/")
def get_memory():
    """Return all long-term memory facts and preferences."""
    return pm.get_all()


# ── FACTS ─────────────────────────────────────────────
@router.post("/facts")
def add_fact(body: FactBody):
    """Add a new fact to long-term memory."""
    fact = body.fact.strip()
    if not fact:
        raise HTTPException(status_code=400, detail="Fact cannot be empty.")
    pm.add_fact(fact)
    return {"status": "added", "fact": fact}


@router.delete("/facts")
def delete_fact(body: FactBody):
    """Delete a specific fact from long-term memory."""
    pm.delete_fact(body.fact)
    return {"status": "deleted", "fact": body.fact}


# ── PREFERENCES ──────────────────────────────────────
@router.post("/preferences")
def set_preference(body: PreferenceBody):
    """Set or update a preference."""
    pm.set_preference(body.key.strip(), body.value.strip())
    return {"status": "set", "key": body.key, "value": body.value}


@router.delete("/preferences")
def delete_preference(body: PreferenceKeyBody):
    """Delete a preference by key."""
    pm.delete_preference(body.key)
    return {"status": "deleted", "key": body.key}


# ── CLEAR ALL ────────────────────────────────────────
@router.delete("/clear")
def clear_all_memory():
    """Clear ALL long-term memory facts and preferences."""
    pm.clear_all()
    return {"status": "cleared"}
