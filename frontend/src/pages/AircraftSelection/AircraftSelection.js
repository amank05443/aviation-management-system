import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { FaPlane, FaHelicopter, FaJetFighterUp, FaCircleCheck } from 'react-icons/fa6';
import './AircraftSelection.css';

const AircraftSelection = () => {
  const [aircraftTypes, setAircraftTypes] = useState([]);
  const [selectedType, setSelectedType] = useState('');
  const [aircraftList, setAircraftList] = useState([]);
  const [selectedAircraft, setSelectedAircraft] = useState('');
  const [aircraftDetails, setAircraftDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const { selectAircraft } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchAircraftTypes();
  }, []);

  useEffect(() => {
    if (selectedType) {
      fetchAircraftByType(selectedType);
      setSelectedAircraft('');
      setAircraftDetails(null);
    }
  }, [selectedType]);

  useEffect(() => {
    if (selectedAircraft) {
      const aircraft = aircraftList.find(a => a.id.toString() === selectedAircraft);
      setAircraftDetails(aircraft);
    } else {
      setAircraftDetails(null);
    }
  }, [selectedAircraft, aircraftList]);

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
    if (aircraftDetails) {
      selectAircraft(aircraftDetails);
    }
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <div className="aircraft-selection-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading aircraft...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="aircraft-selection-container">
      <div className="selection-wrapper">
        <div className="selection-card-modern">
          {/* Header */}
          <div className="selection-header-modern">
            <div className="header-icon">
              <FaPlane />
            </div>
            <h1>Aircraft Selection</h1>
            <p>Select your aircraft to begin operations</p>
          </div>

          {/* Selection Form */}
          <div className="selection-form">
            {/* Aircraft Type Dropdown */}
            <div className="form-group">
              <label htmlFor="aircraft-type">
                <span className="label-icon">{getTypeIcon(selectedType)}</span>
                Aircraft Type
              </label>
              <select
                id="aircraft-type"
                className="modern-select"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                <option value="">-- Select Aircraft Type --</option>
                {aircraftTypes.map((type) => (
                  <option key={type} value={type}>
                    {getTypeName(type)}
                  </option>
                ))}
              </select>
            </div>

            {/* Aircraft Number Dropdown */}
            {selectedType && (
              <div className="form-group animate-in">
                <label htmlFor="aircraft-number">
                  <span className="label-icon">
                    <FaCircleCheck />
                  </span>
                  Aircraft Number
                </label>
                {aircraftList.length > 0 ? (
                  <select
                    id="aircraft-number"
                    className="modern-select"
                    value={selectedAircraft}
                    onChange={(e) => setSelectedAircraft(e.target.value)}
                  >
                    <option value="">-- Select Aircraft --</option>
                    {aircraftList.map((aircraft) => (
                      <option key={aircraft.id} value={aircraft.id}>
                        {aircraft.aircraft_number} - {aircraft.model} ({aircraft.status})
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="empty-message">
                    No aircraft available for this type
                  </div>
                )}
              </div>
            )}

            {/* Aircraft Details Card */}
            {aircraftDetails && (
              <div className="aircraft-details-card animate-in">
                <div className="details-header">
                  <div className="details-icon">
                    {getTypeIcon(selectedType)}
                  </div>
                  <div className="details-title">
                    <h3>{aircraftDetails.aircraft_number}</h3>
                    <span className="details-subtitle">{aircraftDetails.model}</span>
                  </div>
                </div>
                <div className="details-body">
                  <div className="detail-item">
                    <span className="detail-label">Type:</span>
                    <span className="detail-value">{getTypeName(aircraftDetails.aircraft_type)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Status:</span>
                    <span className={`status-badge status-${aircraftDetails.status.toLowerCase()}`}>
                      {aircraftDetails.status}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Model:</span>
                    <span className="detail-value">{aircraftDetails.model}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            <button
              className="btn-proceed"
              onClick={handleProceed}
            >
              {aircraftDetails ? 'Proceed to Dashboard' : 'Skip & Go to Dashboard'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AircraftSelection;
