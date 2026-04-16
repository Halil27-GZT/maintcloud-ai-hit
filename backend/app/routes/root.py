from fastapi import APIRouter


router = APIRouter()


@router.get("/")
def root():
    return {
        "project": "MaintCloud AI",
        "brand": "H.I.T",
        "status": "running",
    }
