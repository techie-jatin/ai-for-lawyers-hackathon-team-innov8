"""
API Routes for REA (Reverse Engineer Anything) Legal Reasoning Engine
Provides endpoints for:
- Legal AST Decompilation
- Statutory Ingredient Call-Graph Evaluation
- Tri-Perspective Chamber Battle-Room Deliberation
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

from app.services.rea import (
    LegalDecompiler,
    StatutoryIngredientMatcher,
    TriPerspectiveChamber,
)

router = APIRouter()

decompiler = LegalDecompiler()
ingredient_matcher = StatutoryIngredientMatcher()
chamber = TriPerspectiveChamber()


class DecompileRequest(BaseModel):
    narrative: str = Field(..., min_length=5, description="Factual dispute narrative, complaint text, or FIR summary")


class EvaluateRequest(BaseModel):
    narrative: Optional[str] = Field(None, description="Factual narrative if AST is not already decompiled")
    ast_data: Optional[Dict[str, Any]] = Field(None, description="Pre-existing Legal AST dictionary")


class ChamberRequest(BaseModel):
    narrative: str = Field(..., min_length=5, description="Factual dispute narrative")


@router.post("/decompile")
def decompile_narrative(req: DecompileRequest):
    """
    Decompiles unstructured factual narratives into a typed Legal AST.
    Separates admitted facts from allegations, extracts temporal/territorial anchors,
    and identifies the core legal pillar and cause of action.
    """
    try:
        ast = decompiler.decompile(req.narrative)
        return {"status": "success", "ast": ast.to_dict()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Decompilation failed: {str(e)}")


@router.post("/evaluate")
def evaluate_ingredients(req: EvaluateRequest):
    """
    Evaluates Legal AST against statutory essential ingredients under Indian Law.
    Returns satisfied elements, evidentiary gaps, and procedural cures.
    """
    try:
        if req.narrative:
            ast = decompiler.decompile(req.narrative)
        elif req.ast_data:
            # Reconstruct or decompile from raw_narrative
            raw = req.ast_data.get("raw_narrative", "")
            ast = decompiler.decompile(raw)
        else:
            raise HTTPException(status_code=400, detail="Either narrative or ast_data must be provided.")

        result = ingredient_matcher.evaluate(ast)
        return {"status": "success", "evaluation": result.to_dict()}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ingredient evaluation failed: {str(e)}")


@router.post("/chamber")
def run_chamber_deliberation(req: ChamberRequest):
    """
    Executes full Tri-Perspective Chamber Battle-Room deliberation:
    - Petitioner Senior Counsel Brief
    - Opposing Senior Counsel (Devil's Advocate) Brief
    - Judicial Bench Probable Ruling, Success Probability %, and Consent Settlement Terms.
    """
    try:
        ast = decompiler.decompile(req.narrative)
        eval_res = ingredient_matcher.evaluate(ast)
        verdict = chamber.deliberate(ast, eval_res)
        return {
            "status": "success",
            "ast": ast.to_dict(),
            "evaluation": eval_res.to_dict(),
            "verdict": verdict.to_dict()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chamber deliberation failed: {str(e)}")
