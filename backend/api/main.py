from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import auth, problems, strategies, leaderboard, research, dashboard, datasets

app = FastAPI(title="QuantLab API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://*.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(problems.router, prefix="/api")
app.include_router(strategies.router, prefix="/api")
app.include_router(leaderboard.router, prefix="/api")
app.include_router(research.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")
app.include_router(datasets.router, prefix="/api")


@app.get("/health")
async def health():
    return {"status": "ok", "version": "2.0.0"}
