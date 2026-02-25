# database.py
# SQLite — zero setup, file-based, perfect for prototype
# Database file: backend/contractsense.db (auto-created on first run)

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase

DATABASE_URL = "sqlite+aiosqlite:///./contractsense.db"

engine = create_async_engine(DATABASE_URL, echo=False)

SessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


async def get_db():
    async with SessionLocal() as session:
        yield session


async def create_tables():
    """Called once on startup to create all tables."""
    from models.document import Document  # noqa — triggers model registration
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)