import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import { FaChartLine } from 'react-icons/fa6';
import '../SharedStyles.css';

const MaintenanceForecast = () => {
  const { selectedAircraft } = useAuth();
  const [forecasts, setForecasts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (selectedAircraft) {
      fetchForecasts();
    }
  }, [selectedAircraft]);

  const fetchForecasts = async () => {
    try {
      const response = await axios.get(`/api/maintenance-forecasts/?aircraft_id=${selectedAircraft.id}`);
      setForecasts(response.data);
    } catch (error) {
      console.error('Failed to fetch maintenance forecasts:', error);
    } finally {
      setLoading(false);
    }
  };

  const chartData = {
    labels: forecasts.map(f => {
      const date = new Date(f.forecast_month);
      return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    }),
    datasets: [
      {
        label: 'Estimated Flying Hours',
        data: forecasts.map(f => parseFloat(f.estimated_flying_hours)),
        borderColor: 'rgb(124, 58, 237)',
        backgroundColor: 'rgba(124, 58, 237, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Estimated Maintenance Hours',
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
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  if (loading) {
    return <div className="page-container"><div className="loading-state">Loading...</div></div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">
          <FaChartLine />
          Maintenance Forecast
        </h1>
      </div>

      <div className="page-content">
        {forecasts.length > 0 ? (
          <>
            <div style={{ padding: '2rem', height: '500px' }}>
              <Line options={chartOptions} data={chartData} />
            </div>
            <div className="data-table">
              <table>
                <thead>
                  <tr>
                    <th>Month</th>
                    <th>Estimated Flying Hours</th>
                    <th>Estimated Maintenance Hours</th>
                    <th>Major Maintenance</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {forecasts.map((forecast) => (
                    <tr key={forecast.id}>
                      <td>{new Date(forecast.forecast_month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</td>
                      <td>{forecast.estimated_flying_hours} hrs</td>
                      <td>{forecast.estimated_maintenance_hours} hrs</td>
                      <td>
                        <span className={`badge ${forecast.major_maintenance_due ? 'badge-warning' : 'badge-success'}`}>
                          {forecast.major_maintenance_due ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td>{forecast.notes || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="empty-state">
            <FaChartLine />
            <h3>No Forecast Data</h3>
            <p>No maintenance forecasts available for this aircraft</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MaintenanceForecast;
