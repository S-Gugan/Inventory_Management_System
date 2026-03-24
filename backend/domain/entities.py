from dataclasses import dataclass

@dataclass
class ProductEntity:
    id: int
    name: str
    description: str
    price: float
    quantity: int

    # Business rule example:
    def update_stock(self, amount: int):
        if self.quantity + amount < 0:
            raise ValueError("Insufficient stock")
        self.quantity += amount