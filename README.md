# Inventory Management System

A full-stack inventory platform built with **FastAPI** and **React** to help teams manage product stock, authenticate users securely, and operate from a clean dashboard with export capabilities.

## Key Features

- JWT-based authentication using OAuth2 password flow (`/token`)
- FastAPI-powered REST endpoints for product management
- Product operations currently implemented: create, read (single and list), and delete
- Pydantic request validation for product payloads
- SQLAlchemy ORM integration with PostgreSQL
- Layered backend architecture (`domain`, `application`, `infrastructure`, `presentation`)
- React frontend with login gate and token-based API calls
- Inventory export support in frontend (Excel and PDF)
- Interactive API docs via Swagger UI and ReDoc

## Tech Stack

### Backend

- FastAPI
- Uvicorn
- SQLAlchemy
- Pydantic v2
- PyJWT
- Passlib (bcrypt)
- psycopg2-binary
- python-dotenv
- python-multipart

### Frontend

- React
- Axios
- xlsx
- jspdf
- jspdf-autotable

## Project Structure

```text
Inventory_Management_System/
├── backend/
│   ├── main.py                    # FastAPI app entry point
│   ├── security.py                # JWT + password hashing + auth dependency
│   ├── create_admin.py            # Utility script to seed first admin user
│   ├── .env                       # Backend environment variables
│   ├── application/
│   │   └── use_cases.py           # Product service/use cases
│   ├── domain/
│   │   ├── entities.py            # Core domain entities
│   │   └── repositories.py        # Repository interface contracts
│   ├── infrastructure/
│   │   ├── database.py            # SQLAlchemy engine/session setup
│   │   ├── orm_models.py          # SQLAlchemy models
│   │   └── repositories.py        # SQLAlchemy repository implementations
│   └── presentation/
│       ├── routes.py              # API endpoints
│       └── schemas.py             # Pydantic schemas
├── frontend/
│   ├── package.json
│   ├── public/
│   └── src/
├── requirements.txt
└── README.md
```

## Getting Started

### Prerequisites

- Python **3.10+** (project environment currently appears to be Python 3.13)
- Node.js **18+** and npm
- PostgreSQL running locally or remotely

### A. Backend Installation

1. Open a terminal in the project root.
2. Create and activate a virtual environment.
3. Install backend dependencies.

```bash
# Windows (PowerShell)
python -m venv myenv
.\myenv\Scripts\Activate.ps1
pip install -r requirements.txt
```

### B. Environment Variables

The backend reads environment variables from `backend/.env`.

Required variables:

- `DATABASE_URL`: PostgreSQL connection string
- `SECRET_KEY`: Secret key used to sign JWT tokens

Example:

```env
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/API_Practice
SECRET_KEY=replace_with_a_long_random_secret
```

> Recommended: add a `.env.example` file with placeholder values for team onboarding.

### C. Frontend Installation

```bash
cd frontend
npm install
```

## Running the App

### Development Mode (Backend with Reload)

From the `backend` directory:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Dev Server

From the `frontend` directory:

```bash
npm start
```

Frontend runs on `http://localhost:3000` and proxies API calls to `http://localhost:8000`.

## API Documentation

Once the backend is running:

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Usage Examples

### 1. Get JWT Access Token

```bash
curl -X POST "http://127.0.0.1:8000/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin&password=supersecret123"
```

Sample response:

```json
{
  "access_token": "<jwt_token>",
  "token_type": "bearer"
}
```

### 2. Create a Product (Authenticated)

```bash
curl -X POST "http://127.0.0.1:8000/products/" \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "id": 101,
    "name": "Wireless Mouse",
    "description": "2.4GHz ergonomic mouse",
    "price": 19.99,
    "quantity": 50
  }'
```

### 3. List Products

```bash
curl "http://127.0.0.1:8000/products/"
```

## Development Notes

- `Base.metadata.create_all(bind=engine)` runs at startup, so required tables are auto-created if permissions allow.
- Use `backend/create_admin.py` to seed the initial admin user.
- Protected routes currently include product creation and deletion (token required).

## License

No license file is currently defined in this repository.
