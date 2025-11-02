import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { FaPlane, FaHelicopter, FaJetFighterUp } from 'react-icons/fa6';
import './AircraftSelection.css';

const AircraftSelection = () => {
  const [aircraftTypes, setAircraftTypes] = useState([]);
  const [selectedType, setSelectedType] = useState('');
  const [aircraftList, setAircraftList] = useState([]);
  const [selectedAircraft, setSelectedAircraft] = useState(null);
  const [loading, setLoading] = useState(true);
  const { selectAircraft } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchAircraftTypes();
  }, []);

  useEffect(() => {
    if (selectedType) {
      fetchAircraftByType(selectedType);
    }
  }, [selectedType]);

  const fetchAircraftTypes = async () => {
    try {
      const response = await axios.get('/api/aircraft/types/');
      setAircraftTypes(response.data);
    } catch (error) {
      console.error('Failed to fetch aircraft types:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAircraftByType = async (type) => {
    try {
      const response = await axios.get(`/api/aircraft/by_type/?type=${type}`);
      setAircraftList(response.data);
    } catch (error) {
      console.error('Failed to fetch aircraft:', error);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'FIGHTER':
        return <FaJetFighterUp />;
      case 'HELICOPTER':
        return <FaHelicopter />;
      default:
        return <FaPlane />;
    }
  };

  const getTypeName = (type) => {
    const names = {
      'FIGHTER': 'Fighter Aircraft',
      'TRANSPORT': 'Transport Aircraft',
      'HELICOPTER': 'Helicopter',
      'TRAINER': 'Trainer Aircraft',
      'RECONNAISSANCE': 'Reconnaissance'
    };
    return names[type] || type;
  };

  const handleProceed = () => {
    if (selectedAircraft) {
      selectAircraft(selectedAircraft);
      navigate('/dashboard');
    }
  };

  if (loading) {
    return (
      <div className="aircraft-selection-container">
        <div className="loading-state">Loading aircraft types...</div>
      </div>
    );
  }

  return (
    <div className="aircraft-selection-container">
      <div className="selection-header">
        <h1>Select Aircraft</h1>
        <p>Choose aircraft type and number to proceed</p>
      </div>

      <div className="selection-content">
        <div className="selection-card">
          <h2>Step 1: Select Aircraft Type</h2>
          <div className="aircraft-types-grid">
            {aircraftTypes.map((type) => (
              <div
                key={type}
                className={`aircraft-type-card ${selectedType === type ? 'selected' : ''}`}
                onClick={() => {
                  setSelectedType(type);
                  setSelectedAircraft(null);
                }}
              >
                <div className="aircraft-type-icon">
                  {getTypeIcon(type)}
                </div>
                <div className="aircraft-type-name">
                  {getTypeName(type)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {selectedType && (
          <div className="selection-card">
            <h2>Step 2: Select Aircraft Number</h2>
            {aircraftList.length > 0 ? (
              <div className="aircraft-list-grid">
                {aircraftList.map((aircraft) => (
                  <div
                    key={aircraft.id}
                    className={`aircraft-item-card ${selectedAircraft?.id === aircraft.id ? 'selected' : ''}`}
                    onClick={() => setSelectedAircraft(aircraft)}
                  >
                    <div className="aircraft-item-number">
                      {aircraft.aircraft_number}
                    </div>
                    <div className="aircraft-item-model">
                      {aircraft.model}
                    </div>
                    <div className={`aircraft-item-status status-${aircraft.status.toLowerCase()}`}>
                      {aircraft.status}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <FaPlane />
                </div>
                <p>No aircraft available for this type</p>
              </div>
            )}
          </div>
        )}

        {selectedAircraft && (
          <button
            className="proceed-button"
            onClick={handleProceed}
          >
            Proceed to Dashboard
          </button>
        )}
      </div>
    </div>
  );
};

export default AircraftSelection;
