from database import Users, Communities
from flask_sqlalchemy import SQLAlchemy
from flask import Flask
import os

basedir = os.path.abspath(os.path.dirname(__file__))

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{os.path.join(basedir, 'app.db')}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)
db = SQLAlchemy()


def clear_database():
    with app.app_context():
        # Deletes all rows from Users and Communities
        num_users_deleted = db.session.query(Users).delete()
        num_communities_deleted = db.session.query(Communities).delete()
        db.session.commit()
        print(f"Deleted {num_users_deleted} users and {num_communities_deleted} communities.")
