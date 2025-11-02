import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { FaCircleExclamation, FaPlus } from 'react-icons/fa6';
import '../SharedStyles.css';

const DeferredDefects = () => {
  const { selectedAircraft } = useAuth();
  const [defects, setDefects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (selectedAircraft) {
      fetchDefects();
    }
  }, [selectedAircraft]);

  const fetchDefects = async () => {
    try {
      const response = await axios.get(`/api/deferred-defects/?aircraft_id=${selectedAircraft.id}`);
      setDefects(response.data);
    } catch (error) {
      console.error('Failed to fetch deferred defects:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityBadge = (severity) => {
    const severityMap = {
      'CRITICAL': 'badge-error',
      'MAJOR': 'badge-warning',
      'MINOR': 'badge-info'
    };
    return severityMap[severity] || 'badge-info';
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'OPEN': 'badge-error',
      'IN_PROGRESS': 'badge-warning',
      'RESOLVED': 'badge-success',
      'DEFERRED': 'badge-info'
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
          <FaCircleExclamation />
          Deferred Defects
        </h1>
        <button className="primary-button">
          <FaPlus />
          Report Defect
        </button>
      </div>

      <div className="page-content">
        {defects.length > 0 ? (
          <div className="data-table">
            <table>
              <thead>
                <tr>
                  <th>Defect Number</th>
                  <th>Title</th>
                  <th>Description</th>
                  <th>Severity</th>
                  <th>Status</th>
                  <th>Reported Date</th>
                  <th>Reported By</th>
                </tr>
              </thead>
              <tbody>
                {defects.map((defect) => (
                  <tr key={defect.id}>
                    <td><strong>{defect.defect_number}</strong></td>
                    <td>{defect.title}</td>
                    <td>{defect.description.substring(0, 60)}...</td>
                    <td>
                      <span className={`badge ${getSeverityBadge(defect.severity)}`}>
                        {defect.severity}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${getStatusBadge(defect.status)}`}>
                        {defect.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td>{new Date(defect.reported_date).toLocaleDateString()}</td>
                    <td>{defect.reported_by_name || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <FaCircleExclamation />
            <h3>No Deferred Defects</h3>
            <p>No defects found for this aircraft</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeferredDefects;
