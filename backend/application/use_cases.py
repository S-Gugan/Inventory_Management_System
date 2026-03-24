from domain.repositories import IProductRepository
from domain.entities import ProductEntity

class ProductService:
    # Notice we inject the interface, not the SQLAlchemy specific repo!
    def __init__(self, repository: IProductRepository):
        self.repo = repository

    def get_all_products(self):
        return self.repo.get_all()

    def get_product(self, product_id: int):
        return self.repo.get_by_id(product_id)

    def create_product(self, data: dict):
        product = ProductEntity(**data)
        self.repo.add(product)
        return product

    def delete_product(self, product_id: int):
        product = self.repo.get_by_id(product_id)
        if not product:
            raise ValueError("Product not found")
        self.repo.delete(product_id)