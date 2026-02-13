from flask import Flask, request, jsonify, session
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_sqlalchemy import SQLAlchemy
from models import db, User, Admin, Vehicle, Violation, Camera
import os
import uuid
from datetime import datetime

# Initialize
app = Flask(__name__)
app.config['SECRET_KEY'] = 'dev-secret-key-123'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///echallan.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['UPLOAD_FOLDER'] = 'uploads'

# Ensure upload directory exists
if not os.path.exists(app.config['UPLOAD_FOLDER']):
    os.makedirs(app.config['UPLOAD_FOLDER'])

CORS(app, supports_credentials=True)
db.init_app(app)
bcrypt = Bcrypt(app)

# Create Database tables
with app.app_context():
    if not os.path.exists('instance'):
        os.makedirs('instance')
    db.create_all()

# ============================
# API ROUTES
# ============================

@app.route('/')
def home():
    return jsonify({"message": "eChallan API is running", "status": "active"})

# --- AUTHENTICATION ---

@app.route('/api/auth/register-user', methods=['POST'])
def register_user():
    data = request.json
    hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')
    
    # Check if vehicle exists in our dummy database?
    vehicle = Vehicle.query.filter_by(vehicle_number=data['vehicleNumber'].upper()).first()
    if not vehicle:
        return jsonify({"error": "Vehicle number not found in RTO database. Cannot verify ownership."}), 400

    if User.query.filter_by(email=data['email']).first():
        return jsonify({"error": "Email already registered"}), 409

    new_user = User(
        first_name=data['firstName'],
        last_name=data['lastName'],
        email=data['email'],
        password=hashed_password,
        phone_number=data['phoneNumber'],
        vehicle_number=data['vehicleNumber'].upper()
    )
    
    try:
        db.session.add(new_user)
        db.session.commit()
        return jsonify({"message": "User registered successfully"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/auth/register-admin', methods=['POST'])
def register_admin():
    data = request.json
    # Validation (In real app, restrict admin creation)
    
    if Admin.query.filter_by(username=data['username']).first():
        return jsonify({"error": "Username already taken"}), 409

    hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')
    
    new_admin = Admin(
        full_name=data['fullName'],
        username=data['username'],
        email=data['email'],
        password=hashed_password
    )

    try:
        db.session.add(new_admin)
        db.session.commit()
        return jsonify({"message": "Admin registered successfully. Waiting for approval (mock)."}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json
    identifier = data.get('identifier')
    password = data.get('password')

    # Try Admin Login Step
    admin = Admin.query.filter((Admin.email == identifier) | (Admin.username == identifier)).first()
    if admin and bcrypt.check_password_hash(admin.password, password):
        return jsonify({
            "message": "Login successful",
            "user": {"name": admin.full_name, "role": "admin", "email": admin.email, "id": admin.id},
            "token": "fake-jwt-token-admin" # Mock token for now
        }), 200

    # Try User Login Step (Email or Vehicle Number?) -> Standard is Email/Phone usually
    user = User.query.filter(User.email == identifier).first()
    if user and bcrypt.check_password_hash(user.password, password):
        return jsonify({
            "message": "Login successful",
            "user": {"name": f"{user.first_name} {user.last_name}", "role": "user", "email": user.email, "vehicle": user.vehicle_number, "id": user.id},
            "token": "fake-jwt-token-user"
        }), 200

    return jsonify({"error": "Invalid credentials"}), 401

# --- CORE FUNCTIONALITY ---

@app.route('/api/upload', methods=['POST'])
def upload_violation():
    # Receive file from Raspberry Pi
    if 'image' not in request.files:
        return jsonify({"error": "No image part"}), 400
    
    file = request.files['image']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    # Process save
    filename = f"{uuid.uuid4()}_{file.filename}"
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(filepath)

    # Create Initial Record
    new_violation = Violation(
        image_path=filepath,
        location="Camera 1 - Main Road", # Mock location for now
        violation_type="Processing...",
        status="pending"
    )
    
    db.session.add(new_violation)
    db.session.commit()

    return jsonify({"message": "File uploaded successfully", "id": new_violation.id}), 201

@app.route('/api/violations', methods=['GET'])
def get_violations():
    violations = Violation.query.order_by(Violation.timestamp.desc()).all()
    result = []
    for v in violations:
        result.append({
            "id": v.id,
            "type": v.violation_type,
            "plate": v.vehicle_number or "Scanning...",
            "status": v.status,
            "timestamp": v.timestamp.strftime("%Y-%m-%d %H:%M"),
            "location": v.location,
            "fine": v.fine_amount
        })
    return jsonify(result), 200

if __name__ == '__main__':
    app.run(debug=True, port=5000)
