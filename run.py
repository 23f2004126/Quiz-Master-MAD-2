import os
from backend.main import create_app
from backend.database import init_db

app = create_app()

if __name__ == '__main__':
    with app.app_context():
        db_path = app.config['SQLALCHEMY_DATABASE_URI'].replace('sqlite:///', '')
        if not os.path.exists(db_path):
            print("Database not found. Initializing...")
            init_db()
            print("Database initialized successfully with an admin user.")
        else:
            print("Database already exists.")
            
    app.run(debug=True, port=5000)