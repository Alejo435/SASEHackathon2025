import os
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.dialects.sqlite import JSON
from flask_login import UserMixin

basedir = os.path.abspath(os.path.dirname(__file__))


db = SQLAlchemy()

class Users(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(150),unique=False, nullable=False)
    last_name = db.Column(db.String(500),unique=False, nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False)
    password = db.Column(db.String(200),unique=False, nullable=False)
    group_ids = db.Column(JSON)

    def __repr__(self):
        return f"<User {self.email}>"

class Communities(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150),unique=True, nullable=False)
    code = db.Column(db.Integer)
    users = db.Column(JSON)
    chat_history = db.Column(JSON)
    

    def __repr__(self):
        return f"<User {self.email}>"