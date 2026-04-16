from fastapi import APIRouter

from app.models import PredictionResult, SensorData
from app.scoring import calculate_risk


router = APIRouter()


@router.post("/prediction", response_model=PredictionResult)
def predict(sensor_data: SensorData):
    result = calculate_risk(sensor_data)

    return PredictionResult(
        machine_id=sensor_data.machine_id,
        risk_score=result["risk_score"],
        status=result["status"],
        message=result["message"],
        recommendation=result["recommendation"],
    )
