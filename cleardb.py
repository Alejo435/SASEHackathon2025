from database import db, Users, Communities
from flask import Flask

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///coraldb.sqlite3' 
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

def clear_database():
    with app.app_context():
        num_users_deleted = db.session.query(Users).delete()
        num_communities_deleted = db.session.query(Communities).delete()
        db.session.commit()
        print(f"Deleted {num_users_deleted} users and {num_communities_deleted} communities.")

if __name__ == "__main__":
    clear_database()