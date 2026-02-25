# models/document.py
# One table: documents
# Stores the file info + full analysis result as JSON

import uuid
from datetime import datetime
from sqlalchemy import String, Integer, DateTime, JSON
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base


class Document(Base):
    __tablename__ = "documents"

    id:          Mapped[str]      = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    filename:    Mapped[str]      = mapped_column(String)
    file_path:   Mapped[str]      = mapped_column(String)        # local path in /uploads
    file_size:   Mapped[int]      = mapped_column(Integer, nullable=True)
    status:      Mapped[str]      = mapped_column(String, default="pending")   # pending | processing | complete | failed
    result:      Mapped[dict]     = mapped_column(JSON, nullable=True)         # full analysis JSON
    error:       Mapped[str]      = mapped_column(String, nullable=True)
    uploaded_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    analyzed_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)