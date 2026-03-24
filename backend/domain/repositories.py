from abc import ABC, abstractmethod
from domain.entities import ProductEntity

class IProductRepository(ABC):

    @abstractmethod
    def get_by_id(self, product_id: int):
        pass

    @abstractmethod
    def get_all(self) -> list[ProductEntity]:
        pass

    @abstractmethod
    def add(self, product: ProductEntity) -> None:
        pass

    @abstractmethod
    def update(self, product: ProductEntity) -> None:
        pass

    @abstractmethod
    def delete(self, product_id: int) -> None:
        pass