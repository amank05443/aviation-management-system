import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { FaClipboardList } from 'react-icons/fa6';
import '../SharedStyles.css';

const LeadingParticulars = () => {
  const { selectedAircraft } = useAuth();
  const [particulars, setParticulars] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (selectedAircraft) {
      fetchParticulars();
    }
  }, [selectedAircraft]);

  const fetchParticulars = async () => {
    try {
      const response = await axios.get(`/api/leading-particulars/`);
      const aircraftParticulars = response.data.find(p => p.aircraft === selectedAircraft.id);
      setParticulars(aircraftParticulars);
    } catch (error) {
      console.error('Failed to fetch leading particulars:', error);
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
          <FaClipboardList />
          Leading Particulars
        </h1>
      </div>

      <div className="page-content">
        {particulars ? (
          <div className="info-grid">
            <div className="info-card">
              <div className="info-label">Engine Type</div>
              <div className="info-value">{particulars.engine_type}</div>
            </div>
            <div className="info-card">
              <div className="info-label">Engine Serial Number</div>
              <div className="info-value">{particulars.engine_serial_number}</div>
            </div>
            <div className="info-card">
              <div className="info-label">Airframe Hours</div>
              <div className="info-value">{particulars.airframe_hours} hrs</div>
            </div>
            <div className="info-card">
              <div className="info-label">Engine Hours</div>
              <div className="info-value">{particulars.engine_hours} hrs</div>
            </div>
            {particulars.propeller_hours && (
              <div className="info-card">
                <div className="info-label">Propeller Hours</div>
                <div className="info-value">{particulars.propeller_hours} hrs</div>
              </div>
            )}
            <div className="info-card">
              <div className="info-label">Maximum Takeoff Weight</div>
              <div className="info-value">{particulars.maximum_takeoff_weight} kg</div>
            </div>
            <div className="info-card">
              <div className="info-label">Maximum Landing Weight</div>
              <div className="info-value">{particulars.maximum_landing_weight} kg</div>
            </div>
            <div className="info-card">
              <div className="info-label">Fuel Tank Capacity</div>
              <div className="info-value">{particulars.fuel_tank_capacity} L</div>
            </div>
          </div>
        ) : (
          <div className="empty-state">
            <FaClipboardList />
            <h3>No Leading Particulars</h3>
            <p>Leading particulars not available for this aircraft</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeadingParticulars;
