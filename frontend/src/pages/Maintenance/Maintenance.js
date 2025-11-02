import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { FaWrench, FaPlus } from 'react-icons/fa6';
import '../SharedStyles.css';

const Maintenance = () => {
  const { selectedAircraft } = useAuth();
  const [maintenanceSchedules, setMaintenanceSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (selectedAircraft) {
      fetchMaintenance();
    }
  }, [selectedAircraft]);

  const fetchMaintenance = async () => {
    try {
      const response = await axios.get(`/api/maintenance-schedules/?aircraft_id=${selectedAircraft.id}`);
      setMaintenanceSchedules(response.data);
    } catch (error) {
      console.error('Failed to fetch maintenance schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'SCHEDULED': 'badge-info',
      'IN_PROGRESS': 'badge-warning',
      'COMPLETED': 'badge-success',
      'CANCELLED': 'badge-error'
    };
    return statusMap[status] || 'badge-info';
  };

  if (loading) {
    return <div className="page-container"><div className="loading-state">Loading...</div></div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">
          <FaWrench />
          Maintenance Schedules
        </h1>
        <button className="primary-button">
          <FaPlus />
          Schedule Maintenance
        </button>
      </div>

      <div className="page-content">
        {maintenanceSchedules.length > 0 ? (
          <div className="data-table">
            <table>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Description</th>
                  <th>Scheduled Date</th>
                  <th>Technician</th>
                  <th>Estimated Hours</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {maintenanceSchedules.map((maintenance) => (
                  <tr key={maintenance.id}>
                    <td>{maintenance.maintenance_type}</td>
                    <td>{maintenance.description}</td>
                    <td>{new Date(maintenance.scheduled_date).toLocaleDateString()}</td>
                    <td>{maintenance.technician_name || 'Not assigned'}</td>
                    <td>{maintenance.estimated_hours} hrs</td>
                    <td>
                      <span className={`badge ${getStatusBadge(maintenance.status)}`}>
                        {maintenance.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <FaWrench />
            <h3>No Maintenance Schedules</h3>
            <p>No maintenance schedules found for this aircraft</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Maintenance;
