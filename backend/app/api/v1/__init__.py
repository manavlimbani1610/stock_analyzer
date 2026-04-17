"""API v1 Router"""

from fastapi import APIRouter
from .stocks import router as stocks_router
from .predictions import router as predictions_router
from .users import router as users_router
from .portfolios import router as portfolios_router

router = APIRouter()

router.include_router(stocks_router, prefix="/stocks", tags=["Stocks"])
router.include_router(predictions_router, prefix="/predictions", tags=["Predictions"])
router.include_router(users_router, prefix="/users", tags=["Users"])
router.include_router(portfolios_router, prefix="/portfolios", tags=["Portfolios"])
