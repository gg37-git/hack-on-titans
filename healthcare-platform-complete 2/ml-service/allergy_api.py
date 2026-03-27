from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib
import numpy as np
import os
from typing import List

app = FastAPI(title="CuraLink Allergy Risk Service")

# Load model and meta
MODEL_PATH = 'ml-service/models/allergy_model.pkl'
META_PATH = 'ml-service/models/metadata.pkl'

if not os.path.exists(MODEL_PATH):
    raise RuntimeError("Model not found. Run train_allergy_model.py first.")

model = joblib.load(MODEL_PATH)
meta = joblib.load(META_PATH)

class AllergyRequest(BaseModel):
    known_allergies: List[str]
    prescribed_medicines: List[str]
    food_intake: List[str]
    age: int
    season: str
    existing_conditions: List[str]

@app.post("/predict-allergy-risk")
async def predict(req: AllergyRequest):
    try:
        # Map season and conditions to codes
        season_code = meta['seasons'].index(req.season) if req.season in meta['seasons'] else 0
        condition_code = meta['conditions'].index(req.existing_conditions[0]) if req.existing_conditions and req.existing_conditions[0] in meta['conditions'] else 0
        
        # One-hot allergies
        allergy_feats = [1 if a in req.known_allergies else 0 for a in meta['allergies']]
        
        # One-hot medicines
        med_feats = [1 if m in req.prescribed_medicines else 0 for m in meta['medicines']]
        
        # One-hot foods
        food_feats = [1 if f in req.food_intake else 0 for f in meta['foods']]
        
        X = np.array([req.age, season_code, condition_code] + allergy_feats + med_feats + food_feats).reshape(1, -1)
        
        prob = model.predict_proba(X)[0][1]
        
        # Determine risk level
        risk_level = "Low"
        if prob > 0.75: risk_level = "Critical"
        elif prob > 0.50: risk_level = "High"
        elif prob > 0.25: risk_level = "Moderate"
        
        # Find triggers (Explainable AI)
        triggered_by = []
        
        # Hardcoded logic for explanation (matches training logic)
        # 1. Penicillin
        if 'penicillin' in req.known_allergies and any(m in ['Amoxicillin', 'Augmentin'] for m in req.prescribed_medicines):
            triggered_by.append("Amoxicillin/Augmentin conflicts with Penicillin allergy")
            
        # 2. Peanuts
        if 'peanuts' in req.known_allergies and 'peanut butter' in req.food_intake:
            triggered_by.append("Peanut butter conflicts with Peanut allergy")
            
        # Recommendations
        recs = {
            "Low": "Everything looks safe. No immediate allergy risks detected.",
            "Moderate": "Caution: Minor conflicts detected. Monitor for mild reactions like itching or sneezing.",
            "High": "Warning: Significant risk detected. Please consult your doctor before consuming these items.",
            "Critical": "EMERGENCY: High likelihood of severe allergic reaction (Anaphylaxis risk). DO NOT consume. Keep an EpiPen ready and call emergency services if symptoms appear."
        }
        
        return {
            "probability": float(prob),
            "risk_level": risk_level,
            "triggered_by": triggered_by,
            "recommendation": recs[risk_level]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
