# main.py
# FastAPI entry point — keeps it minimal

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import create_tables
from app.routers import upload, analysis

logging.basicConfig(level=logging.INFO, format="%(levelname)s  %(name)s  %(message)s")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create SQLite tables on startup if they don't exist
    await create_tables()
    yield


app = FastAPI(
    title="ContractSense AI",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        
        "https://contractsenseai-m.vercel.app"  # ← add this
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload.router,   prefix="/api/v1", tags=["Upload"])
app.include_router(analysis.router, prefix="/api/v1", tags=["Analysis"])


@app.get("/health")
def health():
    return {"status": "ok", "version": "0.1.0-prototype"}