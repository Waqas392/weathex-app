from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import Base, engine
from routers import weather, history, export, auth

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Weathex API",
    description="Full Stack Weather Dashboard API with CRUD and Export functionality.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(weather.router, prefix="/api/weather", tags=["Weather"])
app.include_router(history.router, prefix="/api/history", tags=["History"])
app.include_router(export.router, prefix="/api/export", tags=["Export"])

@app.get("/")
def read_root():
    return {"message": "Welcome to Weathex API. Go to /docs for documentation."}