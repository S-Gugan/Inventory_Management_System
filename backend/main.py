from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from infrastructure.database import engine
from infrastructure.orm_models import Base
from presentation.routes import router as product_router
from fastapi.responses import FileResponse

# Create DB Tables
Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], # This must match your React URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/my-logo.png", include_in_schema=False)
async def serve_logo():
    return FileResponse("frontend/public/my-logo.png")

@app.get("/")
def greet():
    return "Welcome to Gugan World"

# Include our Presentation layer routes
app.include_router(product_router)