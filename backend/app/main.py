from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from . import models, database
from .auth import router as auth_router
from .routes import notes, folders, users  # if tags exists

app = FastAPI()

# --- ✅ Allow CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or restrict to ["http://localhost:3000"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

models.Base.metadata.create_all(bind=database.engine)


# include routers (no extra prefix/tags here)
app.include_router(auth_router)
app.include_router(notes.router)
app.include_router(folders.router)
app.include_router(users.router)
