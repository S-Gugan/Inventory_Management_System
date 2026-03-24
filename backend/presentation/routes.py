from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from presentation.schemas import ProductSchema
from infrastructure.database import get_db
from infrastructure.repositories import SqlAlchemyProductRepository
from application.use_cases import ProductService
from infrastructure.orm_models import UserEntity
from security import verify_password, create_access_token
from security import get_current_user

router = APIRouter()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

@router.post("/token")
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(), 
    db: Session = Depends(get_db)
):
    # 1. Search the database for the username
    user = db.query(UserEntity).filter(UserEntity.username == form_data.username).first()
    
    # 2. If user doesn't exist, or password doesn't match the hash, reject them
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # 3. If they pass, create the token payload
    access_token = create_access_token(
        data={"sub": user.username, "role": user.role}
    )
    
    # 4. Give them the token!
    return {"access_token": access_token, "token_type": "bearer"}

# Dependency Injection setup
def get_product_service(db: Session = Depends(get_db)):
    repo = SqlAlchemyProductRepository(db)
    return ProductService(repository=repo)


@router.get("/products/")
def get_products(service: ProductService = Depends(get_product_service)):
    return service.get_all_products()

@router.get("/products/{id}")
def get_product(id: int, service: ProductService = Depends(get_product_service)):
    product = service.get_product(id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.post("/products/")
def add_product(product: ProductSchema, service: ProductService = Depends(get_product_service), current_user: str = Depends(get_current_user)):
    service.create_product(product.model_dump())
    return {"message": "Product added successfully"}

@router.delete("/products/{id}")
def delete_product(id: int, service: ProductService = Depends(get_product_service), current_user: str = Depends(get_current_user)):
    try:
        service.delete_product(id)
        return {"message": "Product deleted successfully"}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))