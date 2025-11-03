# Aviation Management System

A comprehensive web application for managing aviation operations, maintenance, and aircraft data. Built with Django REST Framework backend and React frontend with a beautiful violet-themed UI.

## Features

### Authentication
- Login with Personnel Number (PNO) and password
- JWT-based authentication
- Protected routes

### Aircraft Management
- Aircraft type and number selection
- Multiple aircraft types support (Fighter, Transport, Helicopter, Trainer, Reconnaissance)
- Aircraft-specific dashboards

### Dashboard
- Real-time aircraft statistics (Flying hours, Fuel level, Tire pressure)
- Recent flying operations overview
- Upcoming maintenance schedules
- Flying hours and maintenance forecast charts
- Quick access to all modules

### Flying Operations
- Track all flight missions
- Mission types (Training, Combat, Transport, Reconnaissance, Patrol)
- Flight details (departure, arrival, duration, fuel consumption)
- Pilot and co-pilot information

### Maintenance Management
- Schedule maintenance activities
- Track maintenance status (Scheduled, In Progress, Completed)
- Maintenance types (Routine, Scheduled, Major Overhaul, Emergency)
- Estimated and actual hours tracking

### Aircraft Details
- **Leading Particulars**: Engine details, airframe hours, weight specifications
- **Maintenance Forecast**: Visual charts and tables for upcoming maintenance
- **Limitations**: Track active and historical aircraft limitations
- **Deferred Defects**: Manage and track defects with severity levels

### UI/UX Features
- Beautiful violet theme throughout the application
- Responsive design for all screen sizes
- Smooth animations and transitions
- Interactive charts using Chart.js
- Clean and modern interface

## Technology Stack

### Backend
- Django 4.2.7
- Django REST Framework 3.14.0
- Simple JWT for authentication
- SQLite database (can be changed to PostgreSQL/MySQL)
- CORS headers for cross-origin requests

### Frontend
- React 18.2.0
- React Router for navigation
- Axios for API calls
- Chart.js & React-ChartJS-2 for data visualization
- React Icons for beautiful icons
- CSS3 with CSS Variables for theming

## Project Structure

```
Aviation/
├── backend/
│   ├── aviation_project/       # Django project settings
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── aviation_app/           # Main Django app
│   │   ├── models.py           # Database models
│   │   ├── serializers.py      # REST API serializers
│   │   ├── views.py            # API views
│   │   ├── urls.py             # API routes
│   │   └── admin.py            # Admin configuration
│   ├── manage.py
│   └── requirements.txt
│
└── frontend/
    ├── public/
    ├── src/
    │   ├── components/         # Reusable components
    │   │   ├── Header/
    │   │   ├── Sidebar/
    │   │   ├── Footer/
    │   │   ├── Layout/
    │   │   └── ProtectedRoute/
    │   ├── pages/              # Page components
    │   │   ├── Login/
    │   │   ├── AircraftSelection/
    │   │   ├── Dashboard/
    │   │   ├── FlyingOperations/
    │   │   ├── Maintenance/
    │   │   ├── LeadingParticulars/
    │   │   ├── MaintenanceForecast/
    │   │   ├── Limitations/
    │   │   └── DeferredDefects/
    │   ├── context/            # React Context
    │   │   └── AuthContext.js
    │   ├── App.js
    │   ├── index.js
    │   └── index.css
    └── package.json
```

## Installation & Setup

### Prerequisites
- Python 3.8 or higher
- Node.js 14 or higher
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Run migrations:
```bash
python manage.py makemigrations
python manage.py migrate
```

5. Create a superuser:
```bash
python manage.py createsuperuser
```

6. Load sample data (optional):
```bash
python manage.py shell
```
Then in the Python shell:
```python
from aviation_app.models import User, Aircraft, LeadingParticulars
from datetime import date

# Create a test user
user = User.objects.create_user(
    pno='12345',
    password='password123',
    full_name='Test Pilot',
    email='pilot@example.com',
    rank='Captain',
    designation='Senior Pilot'
)

# Create a test aircraft
aircraft = Aircraft.objects.create(
    aircraft_number='AF-001',
    aircraft_type='FIGHTER',
    model='F-16 Fighting Falcon',
    manufacturer='Lockheed Martin',
    status='OPERATIONAL',
    total_flying_hours=1500.50,
    fuel_capacity=3200,
    current_fuel_level=2400,
    tire_pressure_main=185,
    tire_pressure_nose=120,
    date_of_manufacture=date(2015, 5, 15),
    date_of_induction=date(2016, 1, 10)
)

# Create leading particulars
LeadingParticulars.objects.create(
    aircraft=aircraft,
    engine_type='Pratt & Whitney F100-PW-229',
    engine_serial_number='ENG-12345',
    airframe_hours=1500.50,
    engine_hours=1450.25,
    maximum_takeoff_weight=19700,
    maximum_landing_weight=15600,
    fuel_tank_capacity=3200
)

print("Sample data created successfully!")
exit()
```

7. Start the development server:
```bash
python manage.py runserver
```

The backend will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The frontend will be available at `http://localhost:3000`

## Running on Single Port (Production-like)

To run both frontend and backend on a single port (8000):

### Option 1: Using the Quick Script (Easiest)
```bash
./run_single_port.sh
```

### Option 2: Manual Steps
```bash
# 1. Build React for production
cd frontend
npm run build

# 2. Collect Django static files
cd ../backend
python manage.py collectstatic --noinput

# 3. Run Django server
python manage.py runserver
```

Everything will now be available at: **http://localhost:8000**

The Django server will serve both the API endpoints and the React app!

## Deployment

For comprehensive deployment instructions including:
- Production configuration
- Railway deployment (easiest)
- AWS EC2 deployment
- DigitalOcean deployment
- Security checklist
- Performance optimization

See the **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** file.

### Quick Deploy to Railway (Recommended)
```bash
npm install -g @railway/cli
railway login
railway init
railway up
```

## Usage

1. **Login**: Use the PNO and password you created (e.g., PNO: 12345, Password: password123)

2. **Select Aircraft**: Choose an aircraft type and then select a specific aircraft number

3. **Dashboard**: View the overview of the selected aircraft with statistics and charts

4. **Navigate**: Use the sidebar to access different modules:
   - Flying Operations: View and manage flight records
   - Maintenance: Schedule and track maintenance activities
   - Leading Particulars: View aircraft specifications
   - Maintenance Forecast: See predicted maintenance needs
   - Limitations: Track aircraft limitations
   - Deferred Defects: Manage reported defects

## API Endpoints

### Authentication
- `POST /api/auth/login/` - User login
- `POST /api/auth/register/` - User registration
- `GET /api/auth/profile/` - Get user profile
- `POST /api/auth/refresh/` - Refresh JWT token

### Aircraft
- `GET /api/aircraft/` - List all aircraft
- `GET /api/aircraft/types/` - Get aircraft types
- `GET /api/aircraft/by_type/?type=FIGHTER` - Get aircraft by type
- `GET /api/aircraft/{id}/` - Get aircraft details

### Dashboard
- `GET /api/dashboard/?aircraft_id={id}` - Get dashboard data

### Flying Operations
- `GET /api/flying-operations/?aircraft_id={id}` - List flying operations
- `POST /api/flying-operations/` - Create new flight record

### Maintenance
- `GET /api/maintenance-schedules/?aircraft_id={id}` - List maintenance schedules
- `POST /api/maintenance-schedules/` - Schedule maintenance

### Other Endpoints
- `/api/leading-particulars/`
- `/api/maintenance-forecasts/`
- `/api/limitations/`
- `/api/deferred-defects/`

## Color Theme

The application uses a violet color scheme:
- Primary Violet: `#7c3aed`
- Secondary Violet: `#a78bfa`
- Violet Gradient: Various shades for depth and visual interest

## Future Enhancements

- [ ] Real-time notifications
- [ ] PDF report generation
- [ ] Advanced analytics and reporting
- [ ] Mobile application
- [ ] Multi-language support
- [ ] Role-based access control
- [ ] Integration with external systems
- [ ] Offline mode support

## License

This project is private and proprietary.

## Support

For support and queries, contact the development team.
