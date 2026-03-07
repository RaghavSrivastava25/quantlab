from fastapi import APIRouter
from data.loaders.dataset_loader import DATASET_LABELS

router = APIRouter(prefix="/datasets", tags=["datasets"])


@router.get("/")
async def list_datasets():
    return [{"key": k, "label": v} for k, v in DATASET_LABELS.items()]
