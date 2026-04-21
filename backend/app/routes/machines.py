from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session

from app.dependencies import get_db
from app.models import ErrorResponse, MachineCreate, MachineResponse, MachineUpdate
from app.services.machine_service import (
    create_machine,
    delete_machine,
    get_machine_by_id,
    list_machines,
    update_machine,
)


router = APIRouter()


@router.get("/machines", response_model=list[MachineResponse])
def get_machines(db: Session = Depends(get_db)):
    return list_machines(db)


@router.get(
    "/machines/{machine_id}",
    response_model=MachineResponse,
    responses={404: {"model": ErrorResponse, "description": "Machine not found"}},
)
def get_machine(machine_id: str, db: Session = Depends(get_db)):
    machine = get_machine_by_id(db, machine_id)
    if machine is None:
        raise HTTPException(status_code=404, detail="Machine not found")
    return machine


@router.post(
    "/machines",
    response_model=MachineResponse,
    status_code=201,
    responses={409: {"model": ErrorResponse, "description": "Machine already exists"}},
)
def add_machine(machine_data: MachineCreate, db: Session = Depends(get_db)):
    existing = get_machine_by_id(db, machine_data.id)
    if existing is not None:
        raise HTTPException(status_code=409, detail="Machine already exists")
    return create_machine(db, machine_data)


@router.put(
    "/machines/{machine_id}",
    response_model=MachineResponse,
    responses={404: {"model": ErrorResponse, "description": "Machine not found"}},
)
def edit_machine(
    machine_id: str, machine_data: MachineUpdate, db: Session = Depends(get_db)
):
    machine = update_machine(db, machine_id, machine_data)
    if machine is None:
        raise HTTPException(status_code=404, detail="Machine not found")
    return machine


@router.delete(
    "/machines/{machine_id}",
    status_code=204,
    responses={404: {"model": ErrorResponse, "description": "Machine not found"}},
)
def remove_machine(machine_id: str, db: Session = Depends(get_db)):
    deleted = delete_machine(db, machine_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Machine not found")
    return Response(status_code=204)
