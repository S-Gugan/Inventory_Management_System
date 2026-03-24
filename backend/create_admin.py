from infrastructure.database import engine
from sqlalchemy.orm import sessionmaker
from infrastructure.orm_models import UserEntity, Base
from security import get_password_hash

# Create the database tables if they don't exist
Base.metadata.create_all(bind=engine)

# Create a temporary database session
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

def create_first_admin():
    # 1. Check if the admin already exists so we don't crash if you run this twice
    existing_user = db.query(UserEntity).filter(UserEntity.username == "admin").first()
    
    if existing_user:
        print("Admin user already exists!")
        return

    # 2. Hash the password before saving it (NEVER save plain text!)
    hashed_pw = get_password_hash("supersecret123")

    # 3. Create the user object
    new_admin = UserEntity(
        username="admin",
        hashed_password=hashed_pw,
        role="admin"
    )

    # 4. Save to the database
    db.add(new_admin)
    db.commit()
    
    print("Success! Admin user created.")
    print("Username: admin")
    print("Password: supersecret123")

if __name__ == "__main__":
    create_first_admin()