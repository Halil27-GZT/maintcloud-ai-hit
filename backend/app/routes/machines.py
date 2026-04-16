from fastapi import APIRouter


router = APIRouter()

machines = [
    {"id": "M-1001", "name": "Hydraulic Press", "type": "Press"},
    {"id": "M-1002", "name": "CNC Machine", "type": "CNC"},
    {"id": "M-1003", "name": "Compressor", "type": "Compressor"},
]


@router.get("/machines")
def get_machines():
    return machines
