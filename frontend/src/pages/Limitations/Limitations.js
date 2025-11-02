import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { FaTriangleExclamation, FaPlus } from 'react-icons/fa6';
import '../SharedStyles.css';

const Limitations = () => {
  const { selectedAircraft } = useAuth();
  const [limitations, setLimitations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (selectedAircraft) {
      fetchLimitations();
    }
  }, [selectedAircraft]);

  const fetchLimitations = async () => {
    try {
      const response = await axios.get(`/api/limitations/?aircraft_id=${selectedAircraft.id}`);
      setLimitations(response.data);
    } catch (error) {
      console.error('Failed to fetch limitations:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="page-container"><div className="loading-state">Loading...</div></div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">
          <FaTriangleExclamation />
          Limitations
        </h1>
        <button className="primary-button">
          <FaPlus />
          Add Limitation
        </button>
      </div>

      <div className="page-content">
        {limitations.length > 0 ? (
          <div className="data-table">
            <table>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Description</th>
                  <th>Imposed Date</th>
                  <th>Lifted Date</th>
                  <th>Imposed By</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {limitations.map((limitation) => (
                  <tr key={limitation.id}>
                    <td>{limitation.limitation_type}</td>
                    <td>{limitation.description}</td>
                    <td>{new Date(limitation.imposed_date).toLocaleDateString()}</td>
                    <td>{limitation.lifted_date ? new Date(limitation.lifted_date).toLocaleDateString() : '-'}</td>
                    <td>{limitation.imposed_by_name || 'N/A'}</td>
                    <td>
                      <span className={`badge ${limitation.is_active ? 'badge-warning' : 'badge-success'}`}>
                        {limitation.is_active ? 'Active' : 'Lifted'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <FaTriangleExclamation />
            <h3>No Limitations</h3>
            <p>No limitations found for this aircraft</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Limitations;
