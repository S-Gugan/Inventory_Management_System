from pydantic import BaseModel

class ProductSchema(BaseModel):
    id: int
    name: str
    description: str
    price: float
    quantity: int