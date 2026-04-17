"""
CRUD Operations for Database Models
"""

from sqlalchemy.orm import Session
from sqlalchemy import and_
from datetime import datetime
from typing import Optional, List
from passlib.context import CryptContext

from . import models

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


# ================== User CRUD ==================

def get_user(db: Session, user_id: int) -> Optional[models.User]:
    return db.query(models.User).filter(models.User.id == user_id).first()


def get_user_by_email(db: Session, email: str) -> Optional[models.User]:
    return db.query(models.User).filter(models.User.email == email).first()


def get_user_by_username(db: Session, username: str) -> Optional[models.User]:
    return db.query(models.User).filter(models.User.username == username).first()


def get_users(db: Session, skip: int = 0, limit: int = 100) -> List[models.User]:
    return db.query(models.User).offset(skip).limit(limit).all()


def create_user(db: Session, email: str, username: str, password: str,
                first_name: str = None, last_name: str = None) -> models.User:
    hashed_password = get_password_hash(password)
    db_user = models.User(
        email=email,
        username=username,
        password_hash=hashed_password,
        first_name=first_name,
        last_name=last_name
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def authenticate_user(db: Session, username: str, password: str) -> Optional[models.User]:
    user = get_user_by_username(db, username)
    if not user:
        user = get_user_by_email(db, username)
    if not user:
        return None
    if not verify_password(password, user.password_hash):
        return None
    return user


# ================== Portfolio CRUD ==================

def get_portfolio(db: Session, portfolio_id: int) -> Optional[models.Portfolio]:
    return db.query(models.Portfolio).filter(models.Portfolio.id == portfolio_id).first()


def get_user_portfolios(db: Session, user_id: int) -> List[models.Portfolio]:
    return db.query(models.Portfolio).filter(models.Portfolio.user_id == user_id).all()


def create_portfolio(db: Session, user_id: int, name: str,
                     description: str = None, is_default: bool = False) -> models.Portfolio:
    db_portfolio = models.Portfolio(
        user_id=user_id,
        name=name,
        description=description,
        is_default=is_default
    )
    db.add(db_portfolio)
    db.commit()
    db.refresh(db_portfolio)
    return db_portfolio


def delete_portfolio(db: Session, portfolio_id: int) -> bool:
    portfolio = get_portfolio(db, portfolio_id)
    if portfolio:
        db.delete(portfolio)
        db.commit()
        return True
    return False


# ================== Holdings CRUD ==================

def get_portfolio_holdings(db: Session, portfolio_id: int) -> List[models.PortfolioHolding]:
    return db.query(models.PortfolioHolding).filter(
        models.PortfolioHolding.portfolio_id == portfolio_id
    ).all()


def add_holding(db: Session, portfolio_id: int, ticker: str,
                quantity: float, average_cost: float, notes: str = None) -> models.PortfolioHolding:
    db_holding = models.PortfolioHolding(
        portfolio_id=portfolio_id,
        ticker=ticker.upper(),
        quantity=quantity,
        average_cost=average_cost,
        notes=notes,
        purchase_date=datetime.now().date()
    )
    db.add(db_holding)
    db.commit()
    db.refresh(db_holding)
    return db_holding


def update_holding(db: Session, holding_id: int,
                   quantity: float = None, average_cost: float = None) -> Optional[models.PortfolioHolding]:
    holding = db.query(models.PortfolioHolding).filter(
        models.PortfolioHolding.id == holding_id
    ).first()
    if holding:
        if quantity is not None:
            holding.quantity = quantity
        if average_cost is not None:
            holding.average_cost = average_cost
        db.commit()
        db.refresh(holding)
    return holding


def delete_holding(db: Session, holding_id: int) -> bool:
    holding = db.query(models.PortfolioHolding).filter(
        models.PortfolioHolding.id == holding_id
    ).first()
    if holding:
        db.delete(holding)
        db.commit()
        return True
    return False


# ================== Watchlist CRUD ==================

def get_user_watchlists(db: Session, user_id: int) -> List[models.Watchlist]:
    return db.query(models.Watchlist).filter(models.Watchlist.user_id == user_id).all()


def create_watchlist(db: Session, user_id: int, name: str,
                     description: str = None) -> models.Watchlist:
    db_watchlist = models.Watchlist(
        user_id=user_id,
        name=name,
        description=description
    )
    db.add(db_watchlist)
    db.commit()
    db.refresh(db_watchlist)
    return db_watchlist


def add_watchlist_item(db: Session, watchlist_id: int, ticker: str,
                       target_price: float = None, notes: str = None) -> models.WatchlistItem:
    db_item = models.WatchlistItem(
        watchlist_id=watchlist_id,
        ticker=ticker.upper(),
        target_price=target_price,
        notes=notes
    )
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item


# ================== Transaction CRUD ==================

def create_transaction(db: Session, user_id: int, ticker: str,
                       transaction_type: str, quantity: float, price: float,
                       portfolio_id: int = None, fees: float = 0,
                       notes: str = None) -> models.Transaction:
    total_amount = quantity * price + fees
    db_transaction = models.Transaction(
        user_id=user_id,
        portfolio_id=portfolio_id,
        ticker=ticker.upper(),
        transaction_type=transaction_type,
        quantity=quantity,
        price=price,
        total_amount=total_amount,
        fees=fees,
        transaction_date=datetime.now(),
        notes=notes
    )
    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)
    return db_transaction


def get_user_transactions(db: Session, user_id: int,
                          ticker: str = None, limit: int = 100) -> List[models.Transaction]:
    query = db.query(models.Transaction).filter(models.Transaction.user_id == user_id)
    if ticker:
        query = query.filter(models.Transaction.ticker == ticker.upper())
    return query.order_by(models.Transaction.transaction_date.desc()).limit(limit).all()


# ================== Prediction History CRUD ==================

def save_prediction(db: Session, ticker: str, prediction_date, target_date,
                    predicted_price: float, confidence: float, model_type: str,
                    trend: str, user_id: int = None) -> models.PredictionHistory:
    db_prediction = models.PredictionHistory(
        user_id=user_id,
        ticker=ticker.upper(),
        prediction_date=prediction_date,
        target_date=target_date,
        predicted_price=predicted_price,
        confidence=confidence,
        model_type=model_type,
        trend=trend
    )
    db.add(db_prediction)
    db.commit()
    db.refresh(db_prediction)
    return db_prediction


def get_prediction_history(db: Session, ticker: str,
                           limit: int = 30) -> List[models.PredictionHistory]:
    return db.query(models.PredictionHistory).filter(
        models.PredictionHistory.ticker == ticker.upper()
    ).order_by(models.PredictionHistory.prediction_date.desc()).limit(limit).all()
