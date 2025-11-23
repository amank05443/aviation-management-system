import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Login from './pages/Login/Login';
import AircraftSelection from './pages/AircraftSelection/AircraftSelection';
import Dashboard from './pages/Dashboard/Dashboard';
import FlyingOperations from './pages/FlyingOperations/FlyingOperations';
import Maintenance from './pages/Maintenance/Maintenance';
import ScheduleMaintenance from './pages/Maintenance/ScheduleMaintenance';
import LeadingParticulars from './pages/LeadingParticulars/LeadingParticulars';
import MaintenanceForecast from './pages/MaintenanceForecast/MaintenanceForecast';
import Limitations from './pages/Limitations/Limitations';
import DeferredDefects from './pages/DeferredDefects/DeferredDefects';
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/aircraft-selection" element={
                <ProtectedRoute>
                  <AircraftSelection />
                </ProtectedRoute>
              } />
              <Route path="/" element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="flying-operations" element={<FlyingOperations />} />
                <Route path="maintenance" element={<Maintenance />} />
                <Route path="maintenance/schedule" element={<ScheduleMaintenance />} />
                <Route path="leading-particulars" element={<LeadingParticulars />} />
                <Route path="maintenance-forecast" element={<MaintenanceForecast />} />
                <Route path="limitations" element={<Limitations />} />
                <Route path="deferred-defects" element={<DeferredDefects />} />
              </Route>
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
