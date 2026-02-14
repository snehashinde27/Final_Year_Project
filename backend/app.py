from flask import Flask, request, jsonify, session
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_sqlalchemy import SQLAlchemy
from models import db, User, Admin, Vehicle, Violation, Camera, Payment, SupportTicket, bcrypt
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

CORS(app, supports_credentials=True, resources={r"/api/*": {"origins": "*"}}, allow_headers=["Content-Type", "Authorization", "X-User-Id"])
db.init_app(app)
bcrypt.init_app(app)

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
        # For Demo/Assignment purposes: Automatically create a mock vehicle if doesn't exist
        mock_vehicle = Vehicle(
            vehicle_number=data['vehicleNumber'].upper(),
            owner_name=f"{data['firstName']} {data['lastName']}",
            vehicle_model="Unknown Model (Auto-registered)",
            vehicle_type="Car",
            contact_number=data['phoneNumber'],
            registration_date=datetime.now().date()
        )
        db.session.add(mock_vehicle)
        db.session.commit()

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
        db.session.rollback()
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

# --- USER DASHBOARD APIS ---

def get_current_user():
    # In a real app, verify JWT. Here we use mock token + custom header for demo
    auth_header = request.headers.get('Authorization')
    user_id = request.headers.get('X-User-Id')
    
    if not auth_header or 'fake-jwt-token-user' not in auth_header:
        return None
    
    if user_id:
        try:
            return User.query.get(int(user_id))
        except ValueError:
            return None
    return None

@app.route('/api/user/challans', methods=['GET'])
def get_user_challans():
    user = get_current_user()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401
    
    challans = Violation.query.filter_by(vehicle_number=user.vehicle_number).order_by(Violation.timestamp.desc()).all()
    result = []
    for c in challans:
        result.append({
            "id": c.id,
            "vehicle_number": c.vehicle_number,
            "type": c.violation_type,
            "timestamp": c.timestamp.strftime("%Y-%m-%d %H:%M"),
            "amount": c.fine_amount,
            "status": c.status,
            "location": c.location,
            "image": c.image_path,
            "video": c.video_path,
            "plate_crop": c.cropped_plate_path
        })
    return jsonify(result), 200

@app.route('/api/user/payments', methods=['GET'])
def get_user_payments():
    user = get_current_user()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401
    
    payments = Payment.query.filter_by(user_id=user.id).order_by(Payment.payment_date.desc()).all()
    result = []
    for p in payments:
        result.append({
            "id": p.id,
            "challan_id": p.violation_id,
            "date": p.payment_date.strftime("%Y-%m-%d %H:%M"),
            "amount": p.amount,
            "status": p.status,
            "transaction_ref": p.transaction_ref
        })
    return jsonify(result), 200

@app.route('/api/user/profile', methods=['GET', 'PUT'])
def user_profile():
    user = get_current_user()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401
    
    if request.method == 'GET':
        return jsonify({
            "firstName": user.first_name,
            "lastName": user.last_name,
            "email": user.email,
            "phoneNumber": user.phone_number,
            "vehicleNumber": user.vehicle_number
        }), 200
    
    if request.method == 'PUT':
        data = request.json
        user.email = data.get('email', user.email)
        user.phone_number = data.get('phoneNumber', user.phone_number)
        try:
            db.session.commit()
            return jsonify({"message": "Profile updated successfully"}), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": str(e)}), 500

@app.route('/api/user/support', methods=['GET', 'POST'])
def user_support():
    user = get_current_user()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401
    
    if request.method == 'GET':
        tickets = SupportTicket.query.filter_by(user_id=user.id).order_by(SupportTicket.created_at.desc()).all()
        result = []
        for t in tickets:
            result.append({
                "id": t.id,
                "subject": t.subject,
                "description": t.description,
                "status": t.status,
                "date": t.created_at.strftime("%Y-%m-%d"),
                "challan_id": t.violation_id
            })
        return jsonify(result), 200
    
    if request.method == 'POST':
        data = request.json
        new_ticket = SupportTicket(
            user_id=user.id,
            subject=data['subject'],
            description=data['description'],
            violation_id=data.get('challan_id')
        )
        try:
            db.session.add(new_ticket)
            db.session.commit()
            return jsonify({"message": "Support ticket created successfully", "id": new_ticket.id}), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": str(e)}), 500

@app.route('/api/user/pay-challan', methods=['POST'])
def pay_challan():
    user = get_current_user()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401
    
    data = request.json
    challan_id = data.get('challan_id')
    challan = Violation.query.get(challan_id)
    
    if not challan or challan.vehicle_number != user.vehicle_number:
        return jsonify({"error": "Challan not found"}), 404
    
    if challan.status == 'paid':
        return jsonify({"error": "Challan already paid"}), 400
    
    # Simulate payment
    challan.status = 'paid'
    challan.payment_date = datetime.utcnow()
    challan.transaction_id = f"TRX-{uuid.uuid4().hex[:8].upper()}"
    
    new_payment = Payment(
        user_id=user.id,
        violation_id=challan.id,
        amount=challan.fine_amount,
        transaction_ref=challan.transaction_id
    )
    
    try:
        db.session.add(new_payment)
        db.session.commit()
        return jsonify({"message": "Payment successful", "transaction_ref": challan.transaction_id}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# --- ADMIN DASHBOARD APIS ---

def is_admin():
    auth_header = request.headers.get('Authorization')
    return auth_header and 'fake-jwt-token-admin' in auth_header

@app.route('/api/admin/challans', methods=['GET'])
def admin_get_challans():
    if not is_admin():
        return jsonify({"error": "Unauthorized"}), 401
    
    violations = Violation.query.order_by(Violation.timestamp.desc()).all()
    result = []
    for v in violations:
        # Try to find owner name from Vehicle table
        vehicle = Vehicle.query.get(v.vehicle_number) if v.vehicle_number else None
        result.append({
            "id": v.id,
            "vehicle_number": v.vehicle_number or "Scanning...",
            "owner_name": vehicle.owner_name if vehicle else "Unknown",
            "type": v.violation_type,
            "amount": v.fine_amount,
            "status": v.status,
            "timestamp": v.timestamp.strftime("%Y-%m-%d %H:%M")
        })
    return jsonify(result), 200

@app.route('/api/admin/challan/<int:id>', methods=['GET'])
def admin_get_challan_detail(id):
    if not is_admin():
        return jsonify({"error": "Unauthorized"}), 401
    
    v = Violation.query.get(id)
    if not v:
        return jsonify({"error": "Challan not found"}), 404
    
    vehicle = Vehicle.query.get(v.vehicle_number) if v.vehicle_number else None
    
    return jsonify({
        "id": v.id,
        "vehicle_number": v.vehicle_number,
        "owner_name": vehicle.owner_name if vehicle else "Unknown",
        "type": v.violation_type,
        "amount": v.fine_amount,
        "status": v.status,
        "timestamp": v.timestamp.strftime("%Y-%m-%d %H:%M"),
        "location": v.location,
        "image": v.image_path,
        "video": v.video_path,
        "plate_crop": v.cropped_plate_path,
        "payment_date": v.payment_date.strftime("%Y-%m-%d %H:%M") if v.payment_date else None,
        "transaction_id": v.transaction_id
    }), 200

@app.route('/api/admin/statistics', methods=['GET'])
def get_admin_stats():
    if not is_admin():
        return jsonify({"error": "Unauthorized"}), 401
    
    total_violations = Violation.query.count()
    today_start = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
    today_violations = Violation.query.filter(Violation.timestamp >= today_start).count()
    paid_challans = Violation.query.filter_by(status='paid').count()
    unpaid_challans = Violation.query.filter_by(status='pending').count()
    active_cameras = Camera.query.filter_by(status='active').count()
    
    # Simple chart data: Violations in last 7 days
    from sqlalchemy import func, timedelta
    chart_data = []
    for i in range(6, -1, -1):
        day = (datetime.now() - timedelta(days=i)).date()
        count = Violation.query.filter(func.date(Violation.timestamp) == day).count()
        chart_data.append({"date": day.strftime("%b %d"), "count": count})
        
    vehicle_types = db.session.query(Vehicle.vehicle_type, func.count(Violation.id)).join(Violation, Violation.vehicle_number == Vehicle.vehicle_number).group_by(Vehicle.vehicle_type).all()
    type_stats = [{"type": t, "count": c} for t, c in vehicle_types]

    return jsonify({
        "total": total_violations,
        "today": today_violations,
        "paid": paid_challans,
        "unpaid": unpaid_challans,
        "active_cameras": active_cameras,
        "daily_violations": chart_data,
        "vehicle_type_stats": type_stats
    }), 200

@app.route('/api/admin/cameras', methods=['GET'])
def admin_get_cameras():
    if not is_admin():
        return jsonify({"error": "Unauthorized"}), 401
    
    cameras = Camera.query.all()
    # If no cameras exist, seed some for demo
    if not cameras:
        cam1 = Camera(location="Sector 1, Main Crossroad", status="active")
        cam2 = Camera(location="North Entry Point", status="active")
        cam3 = Camera(location="Highway Exit B", status="offline")
        cam4 = Camera(location="Traffic Square A", status="active")
        db.session.add_all([cam1, cam2, cam3, cam4])
        db.session.commit()
        cameras = Camera.query.all()

    result = []
    for c in cameras:
        result.append({
            "id": c.id,
            "location": c.location,
            "status": c.status,
            "last_active": c.last_active.strftime("%Y-%m-%d %H:%M"),
            "ip_address": c.ip_address or f"192.168.1.{100+c.id}"
        })
    return jsonify(result[:6]), 200 # Limited to 6 as requested

@app.route('/api/admin/camera/<int:id>/stream', methods=['GET'])
def get_camera_stream(id):
    if not is_admin():
        return jsonify({"error": "Unauthorized"}), 401
    
    cam = Camera.query.get(id)
    if not cam:
        return jsonify({"error": "Camera not found"}), 404
        
    return jsonify({
        "id": cam.id,
        "location": cam.location,
        "status": cam.status,
        "stream_url": f"http://mock-stream-server.io/live/cam_{cam.id}"
    }), 200

if __name__ == '__main__':
    app.run(debug=True, port=5000)
