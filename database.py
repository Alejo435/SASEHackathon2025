import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.dialects.sqlite import JSON

basedir = os.path.abspath(os.path.dirname(__file__))


db = SQLAlchemy()

class Users(db.Model):
    id = db.Column('id', db.Integer, primary_key = True)
    first_name = db.Column(db.String(150), unique = True, nullable = False)
    last_name = db.Column(db.String(500), unique = True, nullable = False)
    group_ids = db.Column(JSON)

    def __repr__(self):
        return '<Name %r>' % self.name

