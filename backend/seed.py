from flask import Flask
from models import db, User, Admin, Vehicle, bcrypt, Violation
from datetime import datetime, timedelta

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///echallan.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)
bcrypt.init_app(app)

def create_dummy_data():
    with app.app_context():
        # Drop all to ensure fresh schema
        db.drop_all()
        db.create_all()

        print("Seeding Vehicles...")
        vehicles = [
            Vehicle(vehicle_number='MH12AB1234', owner_name='Sahil Khan', vehicle_model='Swift Dzire', vehicle_type='Car', contact_number='9876543210', registration_date=datetime.now().date()),
            Vehicle(vehicle_number='MH14CD3456', owner_name='Rahul Sharma', vehicle_model='Honda City', vehicle_type='Car', contact_number='8877665544', registration_date=datetime.now().date()),
            Vehicle(vehicle_number='KA01AB9012', owner_name='Amit Singh', vehicle_model='KTM Duke', vehicle_type='Bike', contact_number='7766554433', registration_date=datetime.now().date()),
            Vehicle(vehicle_number='DL05AB5678', owner_name='Priya Verma', vehicle_model='Tata Nexon', vehicle_type='Car', contact_number='6655443322', registration_date=datetime.now().date()),
        ]
        db.session.add_all(vehicles)
        db.session.commit()
        print("Vehicles Seeded!")

        print("Seeding Admin...")
        hashed_pw = bcrypt.generate_password_hash('admin123').decode('utf-8')
        admin = Admin(full_name='System Administrator', username='admin', email='admin@echallan.gov.in', password=hashed_pw)
        db.session.add(admin)
        db.session.commit()
        print("Admin User Created (User: admin, Pass: admin123)")

        print("Seeding Sample Violations...")
        violations = [
            Violation(
                vehicle_number='MH12AB1234',
                violation_type='Over Speeding',
                location='Mumbai-Pune Expressway, KM 42',
                timestamp=datetime.now() - timedelta(days=2),
                status='pending',
                fine_amount=1000.0,
                image_path='uploads/sample_violation_1.jpg'
            ),
            Violation(
                vehicle_number='MH12AB1234',
                violation_type='No Helmet',
                location='Shivaji Nagar, Pune',
                timestamp=datetime.now() - timedelta(days=5),
                status='paid',
                fine_amount=500.0,
                image_path='uploads/sample_violation_2.jpg',
                payment_date=datetime.now() - timedelta(days=4),
                transaction_id='TXN_MOCK_12345'
            ),
            Violation(
                vehicle_number='KA01AB9012',
                violation_type='Wrong Side Driving',
                location='Indiranagar, Bangalore',
                timestamp=datetime.now() - timedelta(days=1),
                status='pending',
                fine_amount=2000.0,
                image_path='uploads/sample_violation_3.jpg'
            )
        ]
        db.session.add_all(violations)
        db.session.commit()
        print("Sample Violations Seeded!")

if __name__ == '__main__':
    create_dummy_data()
