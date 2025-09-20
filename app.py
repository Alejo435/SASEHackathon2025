import os
from flask import Flask, render_template, jsonify, url_for, request, redirect, send_from_directory
from werkzeug.utils import secure_filename
from database import db, Users

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///coraldb.sqlite3'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

# Ensure the uploads folder exists
if not os.path.exists("uploads"):
    os.makedirs("uploads")

# Initialize database
with app.app_context():
    db.drop_all()
    db.create_all()

    # Sample Data
    db.session.add(Users(first_name="Alejandro", last_name="Otermin", group_ids=[123456,654321]))
    db.session.commit()


@app.route('/')
def home():
    """Renders the homepage (index.html)."""
    # global logged_in
    # if logged_in:
    return render_template('index.html')
    # return redirect(url_for('login'))

@app.route('/login')
def login():
    return render_template("login.html")

@app.route('/signup')
def signup():
    return render_template("signup.html")

@app.route('/chat')
def chat():
    """Renders the page (chat-menu.html)."""
    return render_template('chat-menu.html')

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=80)
