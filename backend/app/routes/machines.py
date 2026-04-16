from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.dependencies import get_db
from app.models import MachineCreate, MachineResponse
from app.services.machine_service import create_machine, get_machine_by_id, list_machines


router = APIRouter()


@router.get("/machines", response_model=list[MachineResponse])
def get_machines(db: Session = Depends(get_db)):
    return list_machines(db)


@router.get("/machines/{machine_id}", response_model=MachineResponse)
def get_machine(machine_id: str, db: Session = Depends(get_db)):
    machine = get_machine_by_id(db, machine_id)
    if machine is None:
        raise HTTPException(status_code=404, detail="Machine not found")
    return machine


@router.post("/machines", response_model=MachineResponse, status_code=201)
def add_machine(machine_data: MachineCreate, db: Session = Depends(get_db)):
    existing = get_machine_by_id(db, machine_data.id)
    if existing is not None:
        raise HTTPException(status_code=409, detail="Machine already exists")
    return create_machine(db, machine_data)
