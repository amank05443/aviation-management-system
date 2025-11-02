import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import {
  FaPlane,
  FaWrench,
  FaGasPump,
  FaGaugeHigh,
  FaCircleInfo
} from 'react-icons/fa6';
import './Dashboard.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Dashboard = () => {
  const { selectedAircraft } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!selectedAircraft) {
      navigate('/aircraft-selection');
      return;
    }
    fetchDashboardData();
  }, [selectedAircraft, navigate]);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get(`/api/dashboard/?aircraft_id=${selectedAircraft.id}`);
      setDashboardData(response.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!selectedAircraft) {
    return null;
  }

  if (loading) {
    return (
      <div className="dashboard">
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--primary-violet)' }}>
          Loading dashboard...
        </div>
      </div>
    );
  }

  const aircraft = dashboardData?.aircraft || selectedAircraft;
  const forecasts = dashboardData?.maintenance_forecasts || [];

  const chartData = {
    labels: forecasts.map(f => {
      const date = new Date(f.forecast_month);
      return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    }),
    datasets: [
      {
        label: 'Flying Hours',
        data: forecasts.map(f => parseFloat(f.estimated_flying_hours)),
        borderColor: 'rgb(124, 58, 237)',
        backgroundColor: 'rgba(124, 58, 237, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Maintenance Hours',
        data: forecasts.map(f => parseFloat(f.estimated_maintenance_hours)),
        borderColor: 'rgb(249, 115, 22)',
        backgroundColor: 'rgba(249, 115, 22, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="dashboard">
      <h1 className="dashboard-title">Dashboard Overview</h1>

      <div className="aircraft-stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-info">
              <h3>Total Flying Hours</h3>
              <div className="stat-value">
                {parseFloat(aircraft.total_flying_hours).toFixed(2)}
                <span className="stat-unit">hrs</span>
              </div>
            </div>
            <div className="stat-icon violet">
              <FaPlane />
            </div>
          </div>
          <div className="stat-footer">
            <FaCircleInfo />
            Accumulated flight hours
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-info">
              <h3>Fuel Level</h3>
              <div className="stat-value">
                {parseFloat(aircraft.current_fuel_level).toFixed(0)}
                <span className="stat-unit">/ {parseFloat(aircraft.fuel_capacity).toFixed(0)} L</span>
              </div>
            </div>
            <div className="stat-icon blue">
              <FaGasPump />
            </div>
          </div>
          <div className="stat-footer">
            <FaCircleInfo />
            {((parseFloat(aircraft.current_fuel_level) / parseFloat(aircraft.fuel_capacity)) * 100).toFixed(0)}% capacity
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-info">
              <h3>Tire Pressure (Main)</h3>
              <div className="stat-value">
                {parseFloat(aircraft.tire_pressure_main).toFixed(1)}
                <span className="stat-unit">PSI</span>
              </div>
            </div>
            <div className="stat-icon green">
              <FaGaugeHigh />
            </div>
          </div>
          <div className="stat-footer">
            <FaCircleInfo />
            Main landing gear
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-info">
              <h3>Tire Pressure (Nose)</h3>
              <div className="stat-value">
                {parseFloat(aircraft.tire_pressure_nose).toFixed(1)}
                <span className="stat-unit">PSI</span>
              </div>
            </div>
            <div className="stat-icon orange">
              <FaGaugeHigh />
            </div>
          </div>
          <div className="stat-footer">
            <FaCircleInfo />
            Nose landing gear
          </div>
        </div>
      </div>

      <div className="main-sections">
        <div className="section-card">
          <div className="section-header">
            <h2>
              <div className="section-icon">
                <FaPlane />
              </div>
              Flying Operations
            </h2>
            <button className="view-all-btn" onClick={() => navigate('/flying-operations')}>
              View All
            </button>
          </div>
          <div className="section-content">
            {dashboardData?.recent_flights?.length > 0 ? (
              <div className="activity-list">
                {dashboardData.recent_flights.slice(0, 2).map((flight, index) => (
                  <div key={index} className="activity-item">
                    <div className="activity-icon">
                      <FaPlane />
                    </div>
                    <div className="activity-details">
                      <div className="activity-title">{flight.mission_type}</div>
                      <div className="activity-description">
                        {flight.departure_location} → {flight.arrival_location} • {flight.flight_hours} hrs
                      </div>
                      <div className="activity-time">{new Date(flight.flight_date).toLocaleDateString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon"><FaPlane /></div>
                <p>No recent flying operations</p>
              </div>
            )}
          </div>
        </div>

        <div className="section-card">
          <div className="section-header">
            <h2>
              <div className="section-icon">
                <FaWrench />
              </div>
              Maintenance
            </h2>
            <button className="view-all-btn" onClick={() => navigate('/maintenance')}>
              View All
            </button>
          </div>
          <div className="section-content">
            {dashboardData?.upcoming_maintenance?.length > 0 ? (
              <div className="activity-list">
                {dashboardData.upcoming_maintenance.slice(0, 2).map((maintenance, index) => (
                  <div key={index} className="activity-item">
                    <div className="activity-icon">
                      <FaWrench />
                    </div>
                    <div className="activity-details">
                      <div className="activity-title">{maintenance.maintenance_type}</div>
                      <div className="activity-description">{maintenance.description}</div>
                      <div className="activity-time">
                        Scheduled: {new Date(maintenance.scheduled_date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon"><FaWrench /></div>
                <p>No upcoming maintenance scheduled</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {forecasts.length > 0 && (
        <div className="chart-card">
          <div className="section-header">
            <h2>Flying Hours & Maintenance Forecast</h2>
          </div>
          <div style={{ height: '180px' }}>
            <Line options={chartOptions} data={chartData} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
