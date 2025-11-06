# 🚀 Aviation System - Quick Start Guide

## ✅ Setup Complete!

Your Aviation System is now ready with:
- ✓ 10 Sample Aircraft (Fighters, Transports, Helicopters, Trainers, Reconnaissance)
- ✓ 10 Test Users with known passwords
- ✓ Database migrations applied
- ✓ Complete Flying Operations workflow implemented

## 📝 Test User Credentials

### For Flying Operations Testing:
| Role | PNO | Password | Purpose |
|------|-----|----------|---------|
| FSI | `FSI001` | `test123` | Flight Safety Inspector |
| AE | `AE001` | `test123` | Air Engineer |
| AL | `AL001` | `test123` | Air Electrical |
| AO | `AO001` | `test123` | Air Ordinance |
| AR | `AR001` | `test123` | Air Radio |
| SE | `SE001` | `test123` | Senior Engineer |
| Supervisor | `SUP001` | `test123` | Supervisor |
| Pilot | `PILOT001` | `test123` | Test Pilot |
| Engineer | `ENG001` | `test123` | Ground Engineer |
| Admin | `admin` | `admin123` | System Administrator |

## 🚀 Starting the Application

### Option 1: Manual Start (Recommended for Development)

**Terminal 1 - Backend Server:**
```bash
cd /Users/aman/Documents/Aviation/backend
python3 manage.py runserver
```
✓ Backend will run on: http://localhost:8000

**Terminal 2 - Frontend Server:**
```bash
cd /Users/aman/Documents/Aviation/frontend
npm start
```
✓ Frontend will run on: http://localhost:3000
✓ Will automatically open in your browser

### Option 2: Using Helper Scripts

We've created convenient scripts for you:

**On Mac/Linux:**
```bash
# Make scripts executable (only needed once)
chmod +x /Users/aman/Documents/Aviation/start-backend.sh
chmod +x /Users/aman/Documents/Aviation/start-frontend.sh

# Start backend
./start-backend.sh

# In another terminal, start frontend
./start-frontend.sh
```

## 🧪 Testing the Complete Workflow

### 1. Login
- Open http://localhost:3000
- Login with PNO: `FSI001`, Password: `test123`

### 2. Aircraft Selection
- Select any aircraft type (Fighter, Transport, etc.)
- Choose a specific aircraft
- Click "Proceed to Dashboard"

### 3. Dashboard
- View aircraft overview and stats
- Click "Flying Operations" to start

### 4. Flying Operations - Complete Workflow

#### Step 1: Before Flying Service (BFS)
1. **FSI Initial Auth**: FSI (FSI001) authenticates
2. **Personnel Selection**: FSI selects tradesmen from list:
   - AE: AE001
   - AL: AL001
   - AO: AO001 (optional)
   - AR: AR001 (optional)
   - SE: SE001 (optional)
   - Supervisor: SUP001 (if required)
3. **AE Data Entry**: Logout and login as `AE001`, enter aircraft parameters
4. **Tradesman Signatures**: Each tradesman logs in and signs:
   - Login as AL001, sign
   - Login as AO001, sign (if assigned)
   - etc.
5. **Supervisor**: Login as SUP001 and sign (if required)
6. **FSI Review**: Login as FSI001, review all data, and approve

#### Step 2: Pilot Acceptance
1. **Logout** from FSI account
2. **Login** as `PILOT001`
3. **Go to Flying Operations** for the same aircraft
4. **View BFS Data**: See all service details and personnel
5. **Complete Checklist**: Check all pre-flight items
6. **Enter Current Readings**: Fuel, tire pressures
7. **Sign & Accept**: Aircraft acceptance locks this section

#### Step 3: Post Flying
1. **Still logged in as PILOT001**
2. **Select Flight Status**: Completed or Terminated
3. **Enter Flight Data**:
   - Flight hours
   - Number of landings
   - If Completed: fuel consumed, post-flight readings
   - If Terminated: reason for termination
4. **Pilot Signs**: Authenticate post-flight data
5. **Logout and Login as ENG001**
6. **Engineer Signs**: Final verification and completion
7. **Start New Operation**: Button appears to reset for next flight

## 🔧 Troubleshooting

### Backend Issues
```bash
# Check if backend is running
lsof -i :8000

# If port is in use
kill -9 $(lsof -t -i:8000)

# Restart backend
cd /Users/aman/Documents/Aviation/backend
python3 manage.py runserver
```

### Frontend Issues
```bash
# Check if frontend is running
lsof -i :3000

# If port is in use
kill -9 $(lsof -t -i:3000)

# Clear cache and restart
cd /Users/aman/Documents/Aviation/frontend
rm -rf node_modules/.cache
npm start
```

### Database Issues
```bash
cd /Users/aman/Documents/Aviation/backend

# Re-run migrations
python3 manage.py migrate

# Recreate test data
python3 manage.py create_test_users
python3 manage.py populate_aircraft
```

## 📚 Available Aircraft

### Fighters (3)
- F-101: F-16 Fighting Falcon
- F-102: F-15 Eagle
- F-103: MiG-29 Fulcrum

### Transport (2)
- T-201: C-130 Hercules
- T-202: C-17 Globemaster III

### Helicopters (2)
- H-301: AH-64 Apache
- H-302: UH-60 Black Hawk

### Trainers (2)
- TR-401: T-38 Talon
- TR-402: PC-21

### Reconnaissance (1)
- R-501: RQ-4 Global Hawk

## 🎯 Quick Login Test

**Fastest way to test:**
1. Start both servers
2. Login as: `admin` / `admin123`
3. Go to Aircraft Selection
4. Select any aircraft
5. View Dashboard
6. Test Flying Operations

---

**Need Help?**
- Check browser console (F12) for errors
- Check backend terminal for API errors
- Verify both servers are running
- Ensure you're using the correct PNO (not username)

**Ready to fly!** ✈️
