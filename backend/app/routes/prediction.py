from fastapi import APIRouter, Depends

from app.dependencies import require_roles
from app.models import PredictionResult, SensorData, UserResponse, UserRole
from app.scoring import calculate_risk


router = APIRouter()


@router.post("/prediction", response_model=PredictionResult)
def predict(
    sensor_data: SensorData,
    _: UserResponse = Depends(
        require_roles(UserRole.admin, UserRole.technician, UserRole.viewer)
    ),
):
    result = calculate_risk(sensor_data)

    return PredictionResult(
        machine_id=sensor_data.machine_id,
        risk_score=result["risk_score"],
        status=result["status"],
        message=result["message"],
        recommendation=result["recommendation"],
    )
