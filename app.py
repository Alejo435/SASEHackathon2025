import os
from flask import Flask, render_template, url_for, request, redirect, flash
from flask_login import (
    LoginManager, login_user, logout_user,
    login_required, current_user
)
from werkzeug.security import generate_password_hash, check_password_hash
from database import db, Users, Communities

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///coraldb.sqlite3'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.secret_key = "your_secret_key"   # change this in production!

db.init_app(app)

# ---- Flask-Login setup ----
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = "login"   # redirect unauthorized users here


@login_manager.user_loader
def load_user(user_id):
    return Users.query.get(int(user_id))


# ---- Initialize DB with sample user ----
with app.app_context():
    db.create_all()

# ---- Routes ----
@app.route('/')
def home():
    if current_user.is_authenticated:
        return render_template('sidebar.html')
    return redirect(url_for('login'))


@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        email = request.form.get("email")
        password = request.form.get("password")

        user = Users.query.filter_by(email=email).first()
        if user and check_password_hash(user.password, password):
            login_user(user)
            return render_template('sidebar.html')
        else:
            flash("Invalid email or password", "danger")

    return render_template("login.html")


@app.route("/signup", methods=["GET", "POST"])
def signup():
    if request.method == "POST":
        # Get form data
        first_name = request.form.get("first_name")
        last_name = request.form.get("last_name")
        email = request.form.get("email")
        password = request.form.get("password")

        # Ensure all fields are filled
        if not first_name or not last_name or not email or not password:
            flash("All fields are required!", "danger")
            return redirect(url_for("signup"))

        # Check if email already exists
        existing_user = Users.query.filter_by(email=email).first()
        if existing_user:
            flash("Email already exists!", "danger")
            return redirect(url_for("signup"))

        # Hash the password
        hashed_pw = generate_password_hash(password)

        # Create new user
        new_user = Users(
            first_name=first_name,
            last_name=last_name,
            email=email,
            password=hashed_pw,
            group_ids=[]
        )
        db.session.add(new_user)
        db.session.commit()


        user = Users.query.filter_by(email=email).first()
        login_user(user)
        return home()

    # For GET requests, just show the signup page
    return render_template("signup.html")


@app.route("/logout")
@login_required
def logout():
    logout_user()
    return redirect(url_for("login"))


@app.route('/chat')
@login_required
def chat():
    return render_template('chat-menu.html')


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=80)
