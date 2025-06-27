# Truck-Routing-System

A comprehensive web application for Truck-Routing-System and management, built with Django backend and React frontend. This application helps businesses optimize delivery routes, manage customers, and visualize route planning on interactive maps.

## 🚀 Features

### Core Functionality
**Route Planning**: Advanced algorithm for optimizing delivery routes
**Customer Management**: Add, edit, delete, and bulk import customers via CSV
**Interactive Maps**: Real-time route visualization using Leaflet maps
**Truck Management**: Manage fleet vehicles and their capacities
**Dashboard Analytics**: Comprehensive statistics and performance metrics
**User Authentication**: Secure login/signup system with JWT tokens

### Key Components
**Data Entry**: Bulk customer import via CSV, individual customer management
**Routes Planning**: Generate optimized routes based on customer locations
**View Routes**: Interactive map visualization with route details
**Dashboard**: Overview of key metrics and statistics

## 🛠️ Tech Stack

### Backend
**Python**: 3.x
**Django**: 5.2.3
**Django REST Framework**: For API endpoints
**JWT Authentication**: Secure user authentication
**CORS**: Cross-origin resource sharing

### Frontend
**React**: 19.1.0
**Vite**: 6.3.5 (Build tool)
**React Router DOM**: 7.6.2 (Routing)
**Axios**: 1.10.0 (HTTP client)
**Leaflet**: 1.9.4 (Interactive maps)
**React Leaflet**: 5.0.0 (React wrapper for Leaflet)
**React Hook Form**: 7.57.0 (Form management)
**React Toastify**: 11.0.5 (Notifications)
**Papa Parse**: 5.5.3 (CSV parsing)
**React CountUp**: 6.5.3 (Animated counters)
**React Icons**: 5.5.0 (Icon library)


## 📋 Prerequisites

Before running this application, make sure you have the following installed:

**Node.js**: 18.x or higher
**Python**: 3.8 or higher
**pip**: Python package manager
**Git**: Version control system

## 🚀 Installation

### 1. Clone the Repository
bash
git clone <repository-url>
cd VehicleRoutingWeb_v2final

### 2. Backend Setup (Django)

#### Create Virtual Environment
bash
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

#### Install Dependencies
bash
# Create requirements.txt if not exists
pip install django==5.2.3
pip install djangorestframework
pip install django-cors-headers
pip install djangorestframework-simplejwt
pip freeze > requirements.txt

#### Database Setup
bash
python manage.py makemigrations
python manage.py migrate

#### Create Superuser (Optional)
bash
python manage.py createsuperuser

#### Run Django Server
bash
python manage.py runserver 0.0.0.0:8000

### 3. Frontend Setup (React)

#### Navigate to Frontend Directory
bash
cd frontend

#### Install Dependencies
bash
npm install

#### Environment Configuration
Create a .env file in the frontend directory with the following variables:
env
VITE_LOGIN_URL=http://localhost:8000/api
VITE_GETCUST_URL=http://localhost:8000/api/customers/
VITE_ADDCUST_URL=http://localhost:8000/api/add-customer/
VITE_DELETECUST_URL=http://localhost:8000/api/delete-customer/
VITE_UPDATECUST_URL=http://localhost:8000/api/update-customer/
VITE_WAREHOUSE_URL=http://localhost:8000/api/warehouse/
VITE_ROUTEPLAN_URL=http://localhost:8000/api/route-plan/

#### Run Development Server
bash
npm run dev

## 📁 Project Structure

VehicleRoutingWeb_v2final/
├── frontend/                 # React frontend application
│   ├── public/              # Static assets
│   ├── src/
│   │   ├── Components/      # React components
│   │   │   ├── Dashboard.jsx
│   │   │   ├── DataEntry.jsx
│   │   │   ├── LoginForm.jsx
│   │   │   ├── Map.jsx
│   │   │   ├── RoutesPlanning.jsx
│   │   │   └── ViewRoutes.jsx
│   │   ├── App.jsx          # Main application component
│   │   └── Api.jsx          # API configuration
│   ├── package.json         # Frontend dependencies
│   └── vite.config.js       # Vite configuration
├── .venv/                   # Python virtual environment
├── requirements.txt         # Python dependencies
└── README.md               # This file

## 🔧 API Endpoints

The Django backend provides the following API endpoints:

POST /api/login/ - User login
POST /api/signup/ - User registration
POST /api/logout/ - User logout
GET /api/customers/ - Get all customers
POST /api/add-customer/ - Add new customer
PUT /api/update-customer - Update customer
DELETE /api/delete-customer - Delete customer
POST /api/warehouse/ - Update warehouse location
GET /api/route-plan/ - Get route planning data

## 🎯 Usage

### 1. Authentication
Access the application at http://localhost:5173
Register a new account or login with existing credentials

### 2. Data Entry
Navigate to "Data Entry" section
Add customers individually or bulk import via CSV
Configure warehouse location and truck information

### 3. Route Planning
Go to "Routes Planning" section
Generate optimized routes based on customer data
View route statistics and analytics

### 4. View Routes
Access "View Routes" for interactive map visualization
Select different days and trucks to view specific routes
Analyze route performance and metrics

## 📊 CSV Import Format

### Customer CSV Format
csv
Customer ID,Business Name,Latitude,Longitude,Google Maps Link
CUST001,ABC Company,23.037227,72.560194,https://maps.google.com/...

### Truck CSV Format
csv
Truck Id,Name,Number,Owner name
TRUCK001,Truck A,TR001,John Doe

## 🔒 Environment Variables

### Frontend (.env)
VITE_LOGIN_URL: Backend authentication endpoint
VITE_GETCUST_URL: Customer data retrieval endpoint
VITE_ADDCUST_URL: Add customer endpoint
VITE_DELETECUST_URL: Delete customer endpoint
VITE_UPDATECUST_URL: Update customer endpoint
VITE_WAREHOUSE_URL: Warehouse management endpoint
VITE_ROUTEPLAN_URL: Route planning endpoint

## 🚀 Deployment

### Frontend Build
bash
cd frontend
npm run build

### Backend Production
bash
# Install production dependencies
pip install gunicorn
pip install whitenoise


**Note**: Make sure both the Django backend and React frontend are running simultaneously for the application to work properly.
