from database import db, Users, Communities
from flask import Flask

# Create a temporary Flask app context if needed
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///coraldb.sqlite3'  # Update path if different
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

def clear_database():
    with app.app_context():
        # Delete all users
        num_users_deleted = db.session.query(Users).delete()
        # Delete all communities
        num_communities_deleted = db.session.query(Communities).delete()
        # Commit changes
        db.session.commit()
        print(f"Deleted {num_users_deleted} users and {num_communities_deleted} communities.")

if __name__ == "__main__":
    clear_database()