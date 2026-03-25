from sqlalchemy.orm import Session
from domain.repositories import IProductRepository
from domain.entities import ProductEntity
from infrastructure.orm_models import ProductModel

class SqlAlchemyProductRepository(IProductRepository):
    def __init__(self, db_session: Session):
        self.db = db_session

    def _to_entity(self, model: ProductModel) -> ProductEntity:
        return ProductEntity(
            id=model.id, name=model.name, description=model.description,
            price=model.price, quantity=model.quantity
        )

    def get_all(self) -> list[ProductEntity]:
        models = self.db.query(ProductModel).all()
        return [self._to_entity(m) for m in models]

    def get_by_id(self, product_id: int) -> ProductEntity | None:
        model = self.db.query(ProductModel).filter(ProductModel.id == product_id).first()
        return self._to_entity(model) if model else None
    
    def add(self, product: ProductEntity) -> None:
        # Convert Domain Entity -> SQLAlchemy Model
        db_model = ProductModel(
            id=product.id, name=product.name, description=product.description,
            price=product.price, quantity=product.quantity
        )
        self.db.add(db_model)
        self.db.commit()
    
    def update(self, product: ProductEntity) -> None:
        model = self.db.query(ProductModel).filter(ProductModel.id == product.id).first()
        if model:
            model.name = product.name
            model.description = product.description
            model.price = product.price
            model.quantity = product.quantity
            self.db.commit()
    
    def delete(self, product_id: int) -> None:
        model = self.db.query(ProductModel).filter(ProductModel.id == product_id).first()
        if model:
            self.db.delete(model)
            self.db.commit()