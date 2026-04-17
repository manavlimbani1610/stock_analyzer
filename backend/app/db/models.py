"""
SQLAlchemy Database Models
"""

from datetime import datetime
from decimal import Decimal
from sqlalchemy import (
    Column, Integer, String, Boolean, DateTime, Date,
    Numeric, Text, Enum, ForeignKey, JSON, Index
)
from sqlalchemy.orm import relationship
from .database import Base
import enum


class TransactionType(str, enum.Enum):
    BUY = "BUY"
    SELL = "SELL"
    DIVIDEND = "DIVIDEND"


class AlertType(str, enum.Enum):
    PRICE_ABOVE = "PRICE_ABOVE"
    PRICE_BELOW = "PRICE_BELOW"
    PERCENT_CHANGE = "PERCENT_CHANGE"
    PREDICTION = "PREDICTION"


class CacheType(str, enum.Enum):
    QUOTE = "QUOTE"
    PROFILE = "PROFILE"
    HISTORICAL = "HISTORICAL"
    NEWS = "NEWS"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    username = Column(String(100), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    first_name = Column(String(100))
    last_name = Column(String(100))
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    portfolios = relationship("Portfolio", back_populates="user", cascade="all, delete-orphan")
    watchlists = relationship("Watchlist", back_populates="user", cascade="all, delete-orphan")
    transactions = relationship("Transaction", back_populates="user", cascade="all, delete-orphan")
    alerts = relationship("Alert", back_populates="user", cascade="all, delete-orphan")

    @property
    def full_name(self):
        return f"{self.first_name or ''} {self.last_name or ''}".strip()


class Portfolio(Base):
    __tablename__ = "portfolios"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    is_default = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="portfolios")
    holdings = relationship("PortfolioHolding", back_populates="portfolio", cascade="all, delete-orphan")
    transactions = relationship("Transaction", back_populates="portfolio")

    __table_args__ = (Index("idx_portfolio_user_id", "user_id"),)


class PortfolioHolding(Base):
    __tablename__ = "portfolio_holdings"

    id = Column(Integer, primary_key=True, index=True)
    portfolio_id = Column(Integer, ForeignKey("portfolios.id", ondelete="CASCADE"), nullable=False)
    ticker = Column(String(10), nullable=False, index=True)
    quantity = Column(Numeric(18, 8), nullable=False)
    average_cost = Column(Numeric(18, 4), nullable=False)
    purchase_date = Column(Date)
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    portfolio = relationship("Portfolio", back_populates="holdings")

    __table_args__ = (
        Index("idx_holding_portfolio_id", "portfolio_id"),
        Index("unique_portfolio_ticker", "portfolio_id", "ticker", unique=True),
    )


class Watchlist(Base):
    __tablename__ = "watchlists"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="watchlists")
    items = relationship("WatchlistItem", back_populates="watchlist", cascade="all, delete-orphan")

    __table_args__ = (Index("idx_watchlist_user_id", "user_id"),)


class WatchlistItem(Base):
    __tablename__ = "watchlist_items"

    id = Column(Integer, primary_key=True, index=True)
    watchlist_id = Column(Integer, ForeignKey("watchlists.id", ondelete="CASCADE"), nullable=False)
    ticker = Column(String(10), nullable=False, index=True)
    target_price = Column(Numeric(18, 4))
    alert_above = Column(Numeric(18, 4))
    alert_below = Column(Numeric(18, 4))
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    watchlist = relationship("Watchlist", back_populates="items")

    __table_args__ = (
        Index("idx_watchlist_item_watchlist_id", "watchlist_id"),
        Index("unique_watchlist_ticker", "watchlist_id", "ticker", unique=True),
    )


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    portfolio_id = Column(Integer, ForeignKey("portfolios.id", ondelete="SET NULL"))
    ticker = Column(String(10), nullable=False, index=True)
    transaction_type = Column(Enum(TransactionType), nullable=False)
    quantity = Column(Numeric(18, 8), nullable=False)
    price = Column(Numeric(18, 4), nullable=False)
    total_amount = Column(Numeric(18, 4), nullable=False)
    fees = Column(Numeric(18, 4), default=0)
    transaction_date = Column(DateTime, nullable=False)
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="transactions")
    portfolio = relationship("Portfolio", back_populates="transactions")

    __table_args__ = (
        Index("idx_transaction_user_id", "user_id"),
        Index("idx_transaction_portfolio_id", "portfolio_id"),
        Index("idx_transaction_date", "transaction_date"),
    )


class PredictionHistory(Base):
    __tablename__ = "prediction_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"))
    ticker = Column(String(10), nullable=False, index=True)
    prediction_date = Column(Date, nullable=False, index=True)
    target_date = Column(Date, nullable=False)
    predicted_price = Column(Numeric(18, 4), nullable=False)
    actual_price = Column(Numeric(18, 4))
    confidence = Column(Numeric(5, 4))
    model_type = Column(String(50))
    trend = Column(String(20))
    created_at = Column(DateTime, default=datetime.utcnow)


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    ticker = Column(String(10), nullable=False, index=True)
    alert_type = Column(Enum(AlertType), nullable=False)
    threshold_value = Column(Numeric(18, 4), nullable=False)
    is_active = Column(Boolean, default=True, index=True)
    is_triggered = Column(Boolean, default=False)
    triggered_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="alerts")

    __table_args__ = (Index("idx_alert_user_id", "user_id"),)


class StockCache(Base):
    __tablename__ = "stock_cache"

    id = Column(Integer, primary_key=True, index=True)
    ticker = Column(String(10), nullable=False)
    cache_type = Column(Enum(CacheType), nullable=False)
    data = Column(JSON, nullable=False)
    expires_at = Column(DateTime, nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        Index("unique_ticker_type", "ticker", "cache_type", unique=True),
    )
