from flask import Flask
from models import db, User, Admin, Vehicle, bcrypt

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///echallan.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)
bcrypt.init_app(app)

def create_dummy_data():
    with app.app_context():
        # Clean Start
        db.create_all()

        print("Seeding Vehicles...")
        if not Vehicle.query.first():
            vehicles = [
                Vehicle(vehicle_number='MH12AB1234', owner_name='Sahil Khan', vehicle_model='Swift Dzire', vehicle_type='Car', contact_number='9876543210', registration_date=datetime.now()),
                Vehicle(vehicle_number='MH14CD3456', owner_name='Rahul Sharma', vehicle_model='Honda City', vehicle_type='Car', contact_number='8877665544', registration_date=datetime.now()),
                Vehicle(vehicle_number='KA01AB9012', owner_name='Amit Singh', vehicle_model='KTM Duke', vehicle_type='Bike', contact_number='7766554433', registration_date=datetime.now()),
                Vehicle(vehicle_number='DL05AB5678', owner_name='Priya Verma', vehicle_model='Tata Nexon', vehicle_type='Car', contact_number='6655443322', registration_date=datetime.now()),
            ]
            db.session.add_all(vehicles)
            db.session.commit()
            print("Vehicles Seeded!")
        else:
            print("Vehicles already exist.")

        print("Seeding Admin...")
        if not Admin.query.filter_by(username='admin').first():
            hashed_pw = bcrypt.generate_password_hash('admin123').decode('utf-8')
            admin = Admin(full_name='System Administrator', username='admin', email='admin@echallan.gov.in', password=hashed_pw)
            db.session.add(admin)
            db.session.commit()
            print("Admin User Created (User: admin, Pass: admin123)")
        else:
            print("Admin already exists.")

from datetime import datetime
if __name__ == '__main__':
    create_dummy_data()
