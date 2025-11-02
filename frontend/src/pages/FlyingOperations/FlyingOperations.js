import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaPlane, FaCheckCircle, FaUserShield, FaClock, FaGasPump } from 'react-icons/fa';
import './FlyingOperations.css';

const FlyingOperations = () => {
  const { selectedAircraft, user } = useAuth();
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState('prepare');
  const [bfsRecord, setBfsRecord] = useState(null);
  const [pilotAcceptance, setPilotAcceptance] = useState(null);
  const [postFlying, setPostFlying] = useState(null);

  // BFS State
  const [supervisorRequired, setSupervisorRequired] = useState(false);
  const [fuelLevel, setFuelLevel] = useState('');
  const [tirePressureMain, setTirePressureMain] = useState('');
  const [tirePressureNose, setTirePressureNose] = useState('');
  const [bfsRemarks, setBfsRemarks] = useState('');

  // Tradesman signatures
  const [tradePins, setTradePins] = useState({
    ae: '', al: '', ao: '', ar: '', se: ''
  });
  const [supervisorPin, setSupervisorPin] = useState('');
  const [fsiPin, setFsiPin] = useState('');

  // Pilot Acceptance State
  const [pilotChecks, setPilotChecks] = useState({
    fuel_level_check: false,
    tire_pressure_check: false,
    engine_check: false,
    controls_check: false,
    instruments_check: false,
    communication_check: false
  });
  const [currentReadings, setCurrentReadings] = useState({
    current_fuel_level: '',
    current_tire_pressure_main: '',
    current_tire_pressure_nose: ''
  });
  const [pilotPin, setPilotPin] = useState('');
  const [acceptanceRemarks, setAcceptanceRemarks] = useState('');

  // Post Flying State
  const [flightHours, setFlightHours] = useState('');
  const [fuelConsumed, setFuelConsumed] = useState('');
  const [fuelLevelAfter, setFuelLevelAfter] = useState('');
  const [tirePressureMainAfter, setTirePressureMainAfter] = useState('');
  const [tirePressureNoseAfter, setTirePressureNoseAfter] = useState('');
  const [engineCondition, setEngineCondition] = useState('');
  const [issuesFound, setIssuesFound] = useState('');
  const [defectsReported, setDefectsReported] = useState(false);
  const [postFlyingPilotPin, setPostFlyingPilotPin] = useState('');
  const [engineerPin, setEngineerPin] = useState('');
  const [postFlyingRemarks, setPostFlyingRemarks] = useState('');

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (!selectedAircraft) {
      navigate('/aircraft-selection');
      return;
    }
    fetchLatestBFS();
  }, [selectedAircraft, navigate]);

  const fetchLatestBFS = async () => {
    try {
      const response = await axios.get(`/api/before-flying-service/?aircraft_id=${selectedAircraft.id}`);
      if (response.data.length > 0) {
        const latest = response.data[0];
        setBfsRecord(latest);

        // Check if pilot acceptance exists
        if (latest.status === 'FSI_APPROVED') {
          fetchPilotAcceptance(latest.id);
        }
      }
    } catch (error) {
      console.error('Error fetching BFS records:', error);
    }
  };

  const fetchPilotAcceptance = async (bfsId) => {
    try {
      const response = await axios.get(`/api/pilot-acceptance/?aircraft_id=${selectedAircraft.id}`);
      const acceptance = response.data.find(pa => pa.bfs_record === bfsId);
      if (acceptance) {
        setPilotAcceptance(acceptance);

        // Check if post flying exists
        if (acceptance.status === 'ACCEPTED') {
          fetchPostFlying(acceptance.id);
        }
      }
    } catch (error) {
      console.error('Error fetching pilot acceptance:', error);
    }
  };

  const fetchPostFlying = async (acceptanceId) => {
    try {
      const response = await axios.get(`/api/post-flying/?aircraft_id=${selectedAircraft.id}`);
      const pf = response.data.find(pf => pf.pilot_acceptance === acceptanceId);
      if (pf) {
        setPostFlying(pf);
      }
    } catch (error) {
      console.error('Error fetching post flying:', error);
    }
  };

  // BFS Handlers
  const handleCreateBFS = async () => {
    try {
      setLoading(true);
      const response = await axios.post('/api/before-flying-service/', {
        aircraft: selectedAircraft.id,
        supervisor_required: supervisorRequired,
        fuel_level_before: fuelLevel,
        tire_pressure_main_before: tirePressureMain,
        tire_pressure_nose_before: tirePressureNose,
        remarks: bfsRemarks
      });

      setBfsRecord(response.data);
      setMessage({ type: 'success', text: 'BFS record created successfully!' });
      setLoading(false);
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to create BFS record' });
      setLoading(false);
    }
  };

  const handleTradesmanSign = async (trade) => {
    if (!tradePins[trade]) {
      setMessage({ type: 'error', text: 'Please enter PIN' });
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`/api/before-flying-service/${bfsRecord.id}/sign_tradesman/`, {
        trade: trade.toUpperCase(),
        pin: tradePins[trade]
      });

      setBfsRecord(response.data);
      setMessage({ type: 'success', text: `${trade.toUpperCase()} signature added successfully!` });
      setTradePins({ ...tradePins, [trade]: '' });
      setLoading(false);
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to sign' });
      setLoading(false);
    }
  };

  const handleSupervisorSign = async () => {
    if (!supervisorPin) {
      setMessage({ type: 'error', text: 'Please enter supervisor PIN' });
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`/api/before-flying-service/${bfsRecord.id}/sign_supervisor/`, {
        pin: supervisorPin
      });

      setBfsRecord(response.data);
      setMessage({ type: 'success', text: 'Supervisor signature added successfully!' });
      setSupervisorPin('');
      setLoading(false);
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to sign' });
      setLoading(false);
    }
  };

  const handleFSISign = async () => {
    if (!fsiPin) {
      setMessage({ type: 'error', text: 'Please enter FSI PIN' });
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`/api/before-flying-service/${bfsRecord.id}/sign_fsi/`, {
        pin: fsiPin
      });

      setBfsRecord(response.data);
      setMessage({ type: 'success', text: 'FSI approved! Pilot acceptance section is now unlocked.' });
      setFsiPin('');
      setActiveSection('pilot-acceptance');
      setLoading(false);
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to sign' });
      setLoading(false);
    }
  };

  // Pilot Acceptance Handlers
  const handleCreatePilotAcceptance = async () => {
    try {
      setLoading(true);
      const response = await axios.post('/api/pilot-acceptance/', {
        bfs_record: bfsRecord.id,
        aircraft: selectedAircraft.id,
        ...pilotChecks,
        ...currentReadings,
        remarks: acceptanceRemarks
      });

      setPilotAcceptance(response.data);
      setMessage({ type: 'success', text: 'Pilot acceptance created successfully!' });
      setLoading(false);
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to create pilot acceptance' });
      setLoading(false);
    }
  };

  const handlePilotSign = async () => {
    if (!pilotPin) {
      setMessage({ type: 'error', text: 'Please enter pilot PIN' });
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`/api/pilot-acceptance/${pilotAcceptance.id}/sign_pilot/`, {
        pin: pilotPin
      });

      setPilotAcceptance(response.data);
      setMessage({ type: 'success', text: 'Pilot acceptance approved! Post flying section is now unlocked.' });
      setPilotPin('');
      setActiveSection('post-flying');
      setLoading(false);
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to sign' });
      setLoading(false);
    }
  };

  // Post Flying Handlers
  const handleCreatePostFlying = async () => {
    try {
      setLoading(true);
      const response = await axios.post('/api/post-flying/', {
        pilot_acceptance: pilotAcceptance.id,
        aircraft: selectedAircraft.id,
        flight_hours: flightHours,
        fuel_consumed: fuelConsumed,
        fuel_level_after: fuelLevelAfter,
        tire_pressure_main_after: tirePressureMainAfter,
        tire_pressure_nose_after: tirePressureNoseAfter,
        engine_condition: engineCondition,
        issues_found: issuesFound,
        defects_reported: defectsReported,
        remarks: postFlyingRemarks
      });

      setPostFlying(response.data);
      setMessage({ type: 'success', text: 'Post flying record created successfully!' });
      setLoading(false);
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to create post flying record' });
      setLoading(false);
    }
  };

  const handlePostFlyingPilotSign = async () => {
    if (!postFlyingPilotPin) {
      setMessage({ type: 'error', text: 'Please enter pilot PIN' });
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`/api/post-flying/${postFlying.id}/sign_pilot/`, {
        pin: postFlyingPilotPin
      });

      setPostFlying(response.data);
      setMessage({ type: 'success', text: 'Pilot signed successfully!' });
      setPostFlyingPilotPin('');
      setLoading(false);
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to sign' });
      setLoading(false);
    }
  };

  const handleEngineerSign = async () => {
    if (!engineerPin) {
      setMessage({ type: 'error', text: 'Please enter engineer PIN' });
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`/api/post-flying/${postFlying.id}/sign_engineer/`, {
        pin: engineerPin
      });

      setPostFlying(response.data);
      setMessage({ type: 'success', text: 'Post flying completed! Aircraft data updated.' });
      setEngineerPin('');
      setLoading(false);
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to sign' });
      setLoading(false);
    }
  };

  const canAccessPilotAcceptance = bfsRecord && bfsRecord.status === 'FSI_APPROVED';
  const canAccessPostFlying = pilotAcceptance && pilotAcceptance.status === 'ACCEPTED';

  return (
    <div className="flying-operations">
      <div className="page-header">
        <h1 className="page-title">
          <FaPlane /> Flying Operations
        </h1>
        <p className="page-subtitle">
          Aircraft: {selectedAircraft?.aircraft_number} - {selectedAircraft?.model}
        </p>
      </div>

      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="section-tabs">
        <button
          className={`tab-button ${activeSection === 'prepare' ? 'active' : ''}`}
          onClick={() => setActiveSection('prepare')}
        >
          <FaPlane /> Prepare Flying (BFS)
        </button>
        <button
          className={`tab-button ${activeSection === 'pilot-acceptance' ? 'active' : ''} ${!canAccessPilotAcceptance ? 'disabled' : ''}`}
          onClick={() => canAccessPilotAcceptance && setActiveSection('pilot-acceptance')}
          disabled={!canAccessPilotAcceptance}
        >
          <FaCheckCircle /> Pilot Acceptance
          {!canAccessPilotAcceptance && <span className="lock-icon">🔒</span>}
        </button>
        <button
          className={`tab-button ${activeSection === 'post-flying' ? 'active' : ''} ${!canAccessPostFlying ? 'disabled' : ''}`}
          onClick={() => canAccessPostFlying && setActiveSection('post-flying')}
          disabled={!canAccessPostFlying}
        >
          <FaClock /> Post Flying
          {!canAccessPostFlying && <span className="lock-icon">🔒</span>}
        </button>
      </div>

      {/* Prepare Flying Section */}
      {activeSection === 'prepare' && (
        <div className="section-content">
          <h2 className="section-title">Before Flying Service (BFS)</h2>

          {!bfsRecord && (
            <div className="form-section">
              <h3>Aircraft Parameters</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Fuel Level (Liters)</label>
                  <input
                    type="number"
                    value={fuelLevel}
                    onChange={(e) => setFuelLevel(e.target.value)}
                    placeholder="Enter fuel level"
                  />
                </div>
                <div className="form-group">
                  <label>Tire Pressure - Main (PSI)</label>
                  <input
                    type="number"
                    value={tirePressureMain}
                    onChange={(e) => setTirePressureMain(e.target.value)}
                    placeholder="Enter main tire pressure"
                  />
                </div>
                <div className="form-group">
                  <label>Tire Pressure - Nose (PSI)</label>
                  <input
                    type="number"
                    value={tirePressureNose}
                    onChange={(e) => setTirePressureNose(e.target.value)}
                    placeholder="Enter nose tire pressure"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={supervisorRequired}
                    onChange={(e) => setSupervisorRequired(e.target.checked)}
                  />
                  Supervisor Signature Required
                </label>
              </div>

              <div className="form-group">
                <label>Remarks</label>
                <textarea
                  value={bfsRemarks}
                  onChange={(e) => setBfsRemarks(e.target.value)}
                  placeholder="Enter any remarks"
                  rows="3"
                />
              </div>

              <button className="btn btn-primary" onClick={handleCreateBFS} disabled={loading}>
                {loading ? 'Creating...' : 'Create BFS Record'}
              </button>
            </div>
          )}

          {bfsRecord && (
            <div className="signatures-section">
              <h3>Tradesmen Signatures</h3>
              <div className="signatures-grid">
                {['ae', 'al', 'ao', 'ar', 'se'].map((trade) => (
                  <div key={trade} className="signature-card">
                    <div className="signature-header">
                      <h4>{trade.toUpperCase()} - {
                        trade === 'ae' ? 'Air Engineer' :
                        trade === 'al' ? 'Air Electrical' :
                        trade === 'ao' ? 'Air Ordinance' :
                        trade === 'ar' ? 'Air Radio' :
                        'Senior Engineer'
                      }</h4>
                      {bfsRecord[`${trade}_signed_at`] && (
                        <FaCheckCircle className="signed-icon" />
                      )}
                    </div>
                    {!bfsRecord[`${trade}_signed_at`] ? (
                      <div className="signature-form">
                        <input
                          type="password"
                          placeholder="Enter PIN"
                          value={tradePins[trade]}
                          onChange={(e) => setTradePins({ ...tradePins, [trade]: e.target.value })}
                        />
                        <button
                          className="btn btn-sm"
                          onClick={() => handleTradesmanSign(trade)}
                          disabled={loading}
                        >
                          Sign
                        </button>
                      </div>
                    ) : (
                      <div className="signature-info">
                        <p>Signed by: {bfsRecord[`${trade}_name`] || user.full_name}</p>
                        <p className="timestamp">
                          {new Date(bfsRecord[`${trade}_signed_at`]).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {supervisorRequired && (
                <div className="supervisor-section">
                  <h3>Supervisor Signature</h3>
                  <div className="signature-card">
                    {!bfsRecord.supervisor_signed_at ? (
                      <div className="signature-form">
                        <input
                          type="password"
                          placeholder="Enter Supervisor PIN"
                          value={supervisorPin}
                          onChange={(e) => setSupervisorPin(e.target.value)}
                        />
                        <button
                          className="btn btn-primary"
                          onClick={handleSupervisorSign}
                          disabled={loading}
                        >
                          Sign as Supervisor
                        </button>
                      </div>
                    ) : (
                      <div className="signature-info">
                        <FaCheckCircle className="signed-icon" />
                        <p>Signed by: {bfsRecord.supervisor_name || user.full_name}</p>
                        <p className="timestamp">
                          {new Date(bfsRecord.supervisor_signed_at).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="fsi-section">
                <h3>FSI Approval <FaUserShield /></h3>
                <div className="signature-card fsi-card">
                  {!bfsRecord.fsi_signed_at ? (
                    <div className="signature-form">
                      <p className="info-text">
                        FSI approval is required to proceed to Pilot Acceptance
                      </p>
                      <input
                        type="password"
                        placeholder="Enter FSI PIN"
                        value={fsiPin}
                        onChange={(e) => setFsiPin(e.target.value)}
                      />
                      <button
                        className="btn btn-success"
                        onClick={handleFSISign}
                        disabled={loading}
                      >
                        Approve as FSI
                      </button>
                    </div>
                  ) : (
                    <div className="signature-info approved">
                      <FaCheckCircle className="signed-icon" />
                      <p>Approved by FSI: {bfsRecord.fsi_name || user.full_name}</p>
                      <p className="timestamp">
                        {new Date(bfsRecord.fsi_signed_at).toLocaleString()}
                      </p>
                      <p className="success-message">
                        ✓ Pilot Acceptance section is now available
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Pilot Acceptance Section */}
      {activeSection === 'pilot-acceptance' && canAccessPilotAcceptance && (
        <div className="section-content">
          <h2 className="section-title">Pilot Acceptance</h2>

          {!pilotAcceptance && (
            <div className="form-section">
              <h3>Aircraft Parameter Checks</h3>
              <div className="checks-grid">
                {Object.keys(pilotChecks).map((check) => (
                  <label key={check} className="checkbox-label check-item">
                    <input
                      type="checkbox"
                      checked={pilotChecks[check]}
                      onChange={(e) => setPilotChecks({ ...pilotChecks, [check]: e.target.checked })}
                    />
                    <span>{check.replace(/_/g, ' ').replace(/check/g, '').toUpperCase()}</span>
                  </label>
                ))}
              </div>

              <h3>Current Readings</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Current Fuel Level (Liters)</label>
                  <input
                    type="number"
                    value={currentReadings.current_fuel_level}
                    onChange={(e) => setCurrentReadings({ ...currentReadings, current_fuel_level: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Current Tire Pressure - Main (PSI)</label>
                  <input
                    type="number"
                    value={currentReadings.current_tire_pressure_main}
                    onChange={(e) => setCurrentReadings({ ...currentReadings, current_tire_pressure_main: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Current Tire Pressure - Nose (PSI)</label>
                  <input
                    type="number"
                    value={currentReadings.current_tire_pressure_nose}
                    onChange={(e) => setCurrentReadings({ ...currentReadings, current_tire_pressure_nose: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Remarks</label>
                <textarea
                  value={acceptanceRemarks}
                  onChange={(e) => setAcceptanceRemarks(e.target.value)}
                  placeholder="Enter any remarks"
                  rows="3"
                />
              </div>

              <button className="btn btn-primary" onClick={handleCreatePilotAcceptance} disabled={loading}>
                {loading ? 'Creating...' : 'Create Pilot Acceptance'}
              </button>
            </div>
          )}

          {pilotAcceptance && !pilotAcceptance.pilot_signed_at && (
            <div className="signature-section">
              <h3>Pilot Signature</h3>
              <div className="signature-card">
                <p className="info-text">
                  Pilot must review all parameters and provide signature PIN to accept the aircraft
                </p>
                <input
                  type="password"
                  placeholder="Enter Pilot PIN"
                  value={pilotPin}
                  onChange={(e) => setPilotPin(e.target.value)}
                />
                <button
                  className="btn btn-success"
                  onClick={handlePilotSign}
                  disabled={loading}
                >
                  Accept Aircraft
                </button>
              </div>
            </div>
          )}

          {pilotAcceptance && pilotAcceptance.pilot_signed_at && (
            <div className="signature-info approved">
              <FaCheckCircle className="signed-icon" />
              <h3>Aircraft Accepted</h3>
              <p>Accepted by: {pilotAcceptance.pilot_name || user.full_name}</p>
              <p className="timestamp">
                {new Date(pilotAcceptance.pilot_signed_at).toLocaleString()}
              </p>
              <p className="success-message">
                ✓ Post Flying section is now available
              </p>
            </div>
          )}
        </div>
      )}

      {/* Post Flying Section */}
      {activeSection === 'post-flying' && canAccessPostFlying && (
        <div className="section-content">
          <h2 className="section-title">Post Flying</h2>

          {!postFlying && (
            <div className="form-section">
              <h3>Flight Details</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Flight Hours</label>
                  <input
                    type="number"
                    step="0.01"
                    value={flightHours}
                    onChange={(e) => setFlightHours(e.target.value)}
                    placeholder="Enter flight hours"
                  />
                </div>
                <div className="form-group">
                  <label>Fuel Consumed (Liters)</label>
                  <input
                    type="number"
                    value={fuelConsumed}
                    onChange={(e) => setFuelConsumed(e.target.value)}
                    placeholder="Enter fuel consumed"
                  />
                </div>
                <div className="form-group">
                  <label>Fuel Level After (Liters)</label>
                  <input
                    type="number"
                    value={fuelLevelAfter}
                    onChange={(e) => setFuelLevelAfter(e.target.value)}
                    placeholder="Enter remaining fuel"
                  />
                </div>
              </div>

              <h3>Post-Flight Inspection</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Tire Pressure - Main After (PSI)</label>
                  <input
                    type="number"
                    value={tirePressureMainAfter}
                    onChange={(e) => setTirePressureMainAfter(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Tire Pressure - Nose After (PSI)</label>
                  <input
                    type="number"
                    value={tirePressureNoseAfter}
                    onChange={(e) => setTirePressureNoseAfter(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Engine Condition</label>
                  <input
                    type="text"
                    value={engineCondition}
                    onChange={(e) => setEngineCondition(e.target.value)}
                    placeholder="e.g., Good, Fair, Needs Attention"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Issues Found</label>
                <textarea
                  value={issuesFound}
                  onChange={(e) => setIssuesFound(e.target.value)}
                  placeholder="Describe any issues found during or after flight"
                  rows="3"
                />
              </div>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={defectsReported}
                  onChange={(e) => setDefectsReported(e.target.checked)}
                />
                Defects Reported
              </label>

              <div className="form-group">
                <label>Remarks</label>
                <textarea
                  value={postFlyingRemarks}
                  onChange={(e) => setPostFlyingRemarks(e.target.value)}
                  placeholder="Enter any additional remarks"
                  rows="3"
                />
              </div>

              <button className="btn btn-primary" onClick={handleCreatePostFlying} disabled={loading}>
                {loading ? 'Creating...' : 'Create Post Flying Record'}
              </button>
            </div>
          )}

          {postFlying && (
            <div className="signatures-section">
              <h3>Signatures</h3>

              <div className="signature-card">
                <h4>Pilot Signature</h4>
                {!postFlying.pilot_signed_at ? (
                  <div className="signature-form">
                    <input
                      type="password"
                      placeholder="Enter Pilot PIN"
                      value={postFlyingPilotPin}
                      onChange={(e) => setPostFlyingPilotPin(e.target.value)}
                    />
                    <button
                      className="btn btn-primary"
                      onClick={handlePostFlyingPilotSign}
                      disabled={loading}
                    >
                      Sign as Pilot
                    </button>
                  </div>
                ) : (
                  <div className="signature-info">
                    <FaCheckCircle className="signed-icon" />
                    <p>Signed by: {postFlying.pilot_name || user.full_name}</p>
                    <p className="timestamp">
                      {new Date(postFlying.pilot_signed_at).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>

              <div className="signature-card">
                <h4>Engineer Signature</h4>
                {!postFlying.engineer_signed_at ? (
                  <div className="signature-form">
                    <p className="info-text">
                      Engineer signature completes the post-flight process and updates aircraft data
                    </p>
                    <input
                      type="password"
                      placeholder="Enter Engineer PIN"
                      value={engineerPin}
                      onChange={(e) => setEngineerPin(e.target.value)}
                    />
                    <button
                      className="btn btn-success"
                      onClick={handleEngineerSign}
                      disabled={loading}
                    >
                      Sign as Engineer & Complete
                    </button>
                  </div>
                ) : (
                  <div className="signature-info approved">
                    <FaCheckCircle className="signed-icon" />
                    <p>Signed by: {postFlying.engineer_name || user.full_name}</p>
                    <p className="timestamp">
                      {new Date(postFlying.engineer_signed_at).toLocaleString()}
                    </p>
                    <p className="success-message">
                      ✓ Post-flight process completed! Aircraft data has been updated.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FlyingOperations;
