"""
Portfolios API Router
Handles portfolio and holdings management
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from decimal import Decimal

from app.db.database import get_db
from app.db import crud

router = APIRouter()


# ================== Schemas ==================

class PortfolioCreate(BaseModel):
    name: str
    description: Optional[str] = None
    is_default: bool = False


class PortfolioResponse(BaseModel):
    id: int
    user_id: int
    name: str
    description: Optional[str]
    is_default: bool
    created_at: datetime

    class Config:
        from_attributes = True


class HoldingCreate(BaseModel):
    ticker: str
    quantity: float
    average_cost: float
    notes: Optional[str] = None


class HoldingUpdate(BaseModel):
    quantity: Optional[float] = None
    average_cost: Optional[float] = None


class HoldingResponse(BaseModel):
    id: int
    portfolio_id: int
    ticker: str
    quantity: Decimal
    average_cost: Decimal
    purchase_date: Optional[datetime]
    notes: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class PortfolioWithHoldings(PortfolioResponse):
    holdings: List[HoldingResponse] = []


# ================== Portfolio Endpoints ==================

@router.get("/", response_model=List[PortfolioResponse])
async def get_portfolios(user_id: int, db: Session = Depends(get_db)):
    """Get all portfolios for a user"""
    return crud.get_user_portfolios(db, user_id)


@router.post("/", response_model=PortfolioResponse, status_code=status.HTTP_201_CREATED)
async def create_portfolio(
    user_id: int,
    portfolio: PortfolioCreate,
    db: Session = Depends(get_db)
):
    """Create a new portfolio"""
    return crud.create_portfolio(
        db=db,
        user_id=user_id,
        name=portfolio.name,
        description=portfolio.description,
        is_default=portfolio.is_default
    )


@router.get("/{portfolio_id}", response_model=PortfolioWithHoldings)
async def get_portfolio(portfolio_id: int, db: Session = Depends(get_db)):
    """Get portfolio with holdings"""
    portfolio = crud.get_portfolio(db, portfolio_id)
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")

    holdings = crud.get_portfolio_holdings(db, portfolio_id)
    return {
        **portfolio.__dict__,
        "holdings": holdings
    }


@router.delete("/{portfolio_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_portfolio(portfolio_id: int, db: Session = Depends(get_db)):
    """Delete a portfolio"""
    if not crud.delete_portfolio(db, portfolio_id):
        raise HTTPException(status_code=404, detail="Portfolio not found")


# ================== Holdings Endpoints ==================

@router.get("/{portfolio_id}/holdings", response_model=List[HoldingResponse])
async def get_holdings(portfolio_id: int, db: Session = Depends(get_db)):
    """Get all holdings in a portfolio"""
    portfolio = crud.get_portfolio(db, portfolio_id)
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    return crud.get_portfolio_holdings(db, portfolio_id)


@router.post("/{portfolio_id}/holdings", response_model=HoldingResponse, status_code=status.HTTP_201_CREATED)
async def add_holding(
    portfolio_id: int,
    holding: HoldingCreate,
    db: Session = Depends(get_db)
):
    """Add a new holding to portfolio"""
    portfolio = crud.get_portfolio(db, portfolio_id)
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")

    return crud.add_holding(
        db=db,
        portfolio_id=portfolio_id,
        ticker=holding.ticker,
        quantity=holding.quantity,
        average_cost=holding.average_cost,
        notes=holding.notes
    )


@router.put("/holdings/{holding_id}", response_model=HoldingResponse)
async def update_holding(
    holding_id: int,
    holding: HoldingUpdate,
    db: Session = Depends(get_db)
):
    """Update a holding"""
    updated = crud.update_holding(
        db=db,
        holding_id=holding_id,
        quantity=holding.quantity,
        average_cost=holding.average_cost
    )
    if not updated:
        raise HTTPException(status_code=404, detail="Holding not found")
    return updated


@router.delete("/holdings/{holding_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_holding(holding_id: int, db: Session = Depends(get_db)):
    """Remove a holding from portfolio"""
    if not crud.delete_holding(db, holding_id):
        raise HTTPException(status_code=404, detail="Holding not found")
