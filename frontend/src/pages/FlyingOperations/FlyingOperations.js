import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  FaPlane, FaCheckCircle, FaUserShield, FaClock, FaGasPump, FaUser,
  FaLock, FaChevronRight, FaTools, FaClipboardCheck, FaExclamationTriangle,
  FaInfoCircle, FaTachometerAlt, FaCog
} from 'react-icons/fa';
import './FlyingOperations.css';

const FlyingOperations = () => {
  const { selectedAircraft, user } = useAuth();
  const navigate = useNavigate();

  const [currentStage, setCurrentStage] = useState(0); // 0: BFS, 1: Pilot Acceptance, 2: Post Flying
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
  const [alert, setAlert] = useState({ type: '', message: '' });

  useEffect(() => {
    if (!selectedAircraft) {
      navigate('/aircraft-selection');
      return;
    }
    fetchLatestBFS();
  }, [selectedAircraft, navigate]);

  useEffect(() => {
    if (alert.message) {
      const timer = setTimeout(() => setAlert({ type: '', message: '' }), 5000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  const fetchLatestBFS = async () => {
    try {
      const response = await axios.get(`/api/before-flying-service/?aircraft_id=${selectedAircraft.id}`);
      if (response.data.length > 0) {
        const latest = response.data[0];
        setBfsRecord(latest);

        if (latest.status === 'FSI_APPROVED') {
          setCurrentStage(1);
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

        if (acceptance.status === 'ACCEPTED') {
          setCurrentStage(2);
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

  const showAlert = (type, message) => {
    setAlert({ type, message });
  };

  // BFS Handlers
  const handleCreateBFS = async () => {
    if (!fuelLevel || !tirePressureMain || !tirePressureNose) {
      showAlert('error', 'Please fill in all aircraft parameters');
      return;
    }

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
      showAlert('success', 'BFS record created successfully! Now collect tradesman signatures.');
      setLoading(false);
    } catch (error) {
      showAlert('error', error.response?.data?.error || 'Failed to create BFS record');
      setLoading(false);
    }
  };

  const handleTradesmanSign = async (trade) => {
    if (!tradePins[trade]) {
      showAlert('error', 'Please enter PIN');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`/api/before-flying-service/${bfsRecord.id}/sign_tradesman/`, {
        trade: trade.toUpperCase(),
        pin: tradePins[trade]
      });

      setBfsRecord(response.data);
      showAlert('success', `${trade.toUpperCase()} signature recorded successfully!`);
      setTradePins({ ...tradePins, [trade]: '' });
      setLoading(false);
    } catch (error) {
      showAlert('error', error.response?.data?.error || 'Failed to sign');
      setLoading(false);
    }
  };

  const handleSupervisorSign = async () => {
    if (!supervisorPin) {
      showAlert('error', 'Please enter supervisor PIN');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`/api/before-flying-service/${bfsRecord.id}/sign_supervisor/`, {
        pin: supervisorPin
      });

      setBfsRecord(response.data);
      showAlert('success', 'Supervisor signature recorded successfully!');
      setSupervisorPin('');
      setLoading(false);
    } catch (error) {
      showAlert('error', error.response?.data?.error || 'Failed to sign');
      setLoading(false);
    }
  };

  const handleFSISign = async () => {
    if (!fsiPin) {
      showAlert('error', 'Please enter FSI PIN');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`/api/before-flying-service/${bfsRecord.id}/sign_fsi/`, {
        pin: fsiPin
      });

      setBfsRecord(response.data);
      showAlert('success', 'FSI approved! Pilot Acceptance stage is now unlocked.');
      setFsiPin('');
      setCurrentStage(1);
      setLoading(false);
    } catch (error) {
      showAlert('error', error.response?.data?.error || 'Failed to sign');
      setLoading(false);
    }
  };

  // Pilot Acceptance Handlers
  const handleCreatePilotAcceptance = async () => {
    if (!currentReadings.current_fuel_level || !currentReadings.current_tire_pressure_main || !currentReadings.current_tire_pressure_nose) {
      showAlert('error', 'Please provide all current readings');
      return;
    }

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
      showAlert('success', 'Pilot acceptance created! Now sign to accept the aircraft.');
      setLoading(false);
    } catch (error) {
      showAlert('error', error.response?.data?.error || 'Failed to create pilot acceptance');
      setLoading(false);
    }
  };

  const handlePilotSign = async () => {
    if (!pilotPin) {
      showAlert('error', 'Please enter pilot PIN');
      return;
    }

    const allChecked = Object.values(pilotChecks).every(check => check === true);
    if (!allChecked) {
      showAlert('warning', 'Not all checks are completed. Please verify before signing.');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`/api/pilot-acceptance/${pilotAcceptance.id}/sign_pilot/`, {
        pin: pilotPin
      });

      setPilotAcceptance(response.data);
      showAlert('success', 'Aircraft accepted! Post Flying stage is now unlocked.');
      setPilotPin('');
      setCurrentStage(2);
      setLoading(false);
    } catch (error) {
      showAlert('error', error.response?.data?.error || 'Failed to sign');
      setLoading(false);
    }
  };

  // Post Flying Handlers
  const handleCreatePostFlying = async () => {
    if (!flightHours || !fuelConsumed || !fuelLevelAfter) {
      showAlert('error', 'Please fill in all flight details');
      return;
    }

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
      showAlert('success', 'Post flying record created! Now collect required signatures.');
      setLoading(false);
    } catch (error) {
      showAlert('error', error.response?.data?.error || 'Failed to create post flying record');
      setLoading(false);
    }
  };

  const handlePostFlyingPilotSign = async () => {
    if (!postFlyingPilotPin) {
      showAlert('error', 'Please enter pilot PIN');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`/api/post-flying/${postFlying.id}/sign_pilot/`, {
        pin: postFlyingPilotPin
      });

      setPostFlying(response.data);
      showAlert('success', 'Pilot signed successfully!');
      setPostFlyingPilotPin('');
      setLoading(false);
    } catch (error) {
      showAlert('error', error.response?.data?.error || 'Failed to sign');
      setLoading(false);
    }
  };

  const handleEngineerSign = async () => {
    if (!engineerPin) {
      showAlert('error', 'Please enter engineer PIN');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`/api/post-flying/${postFlying.id}/sign_engineer/`, {
        pin: engineerPin
      });

      setPostFlying(response.data);
      showAlert('success', 'Flight operation completed! Aircraft data has been updated.');
      setEngineerPin('');
      setLoading(false);
    } catch (error) {
      showAlert('error', error.response?.data?.error || 'Failed to sign');
      setLoading(false);
    }
  };

  // Helper Functions
  const getTradesmanProgress = () => {
    if (!bfsRecord) return 0;
    const trades = ['ae', 'al', 'ao', 'ar', 'se'];
    const signed = trades.filter(trade => bfsRecord[`${trade}_signed_at`]).length;
    return Math.round((signed / trades.length) * 100);
  };

  const getChecklistProgress = () => {
    const total = Object.keys(pilotChecks).length;
    const checked = Object.values(pilotChecks).filter(Boolean).length;
    return Math.round((checked / total) * 100);
  };

  const canAccessStage = (stage) => {
    if (stage === 0) return true;
    if (stage === 1) return bfsRecord && bfsRecord.status === 'FSI_APPROVED';
    if (stage === 2) return pilotAcceptance && pilotAcceptance.status === 'ACCEPTED';
    return false;
  };

  const getStageStatus = (stage) => {
    if (stage === 0) {
      if (!bfsRecord) return 'Not Started';
      if (bfsRecord.status === 'FSI_APPROVED') return 'Completed';
      return 'In Progress';
    }
    if (stage === 1) {
      if (!pilotAcceptance) return canAccessStage(1) ? 'Ready' : 'Locked';
      if (pilotAcceptance.status === 'ACCEPTED') return 'Completed';
      return 'In Progress';
    }
    if (stage === 2) {
      if (!postFlying) return canAccessStage(2) ? 'Ready' : 'Locked';
      if (postFlying.engineer_signed_at) return 'Completed';
      return 'In Progress';
    }
    return 'Locked';
  };

  const stages = [
    { id: 0, title: 'Before Flying Service', icon: <FaTools />, short: 'BFS' },
    { id: 1, title: 'Pilot Acceptance', icon: <FaUserShield />, short: 'Acceptance' },
    { id: 2, title: 'Post Flying', icon: <FaClipboardCheck />, short: 'Post Flight' }
  ];

  const tradesmen = [
    { key: 'ae', title: 'Air Engineer', short: 'AE' },
    { key: 'al', title: 'Air Electrical', short: 'AL' },
    { key: 'ao', title: 'Air Ordinance', short: 'AO' },
    { key: 'ar', title: 'Air Radio', short: 'AR' },
    { key: 'se', title: 'Senior Engineer', short: 'SE' }
  ];

  const isStageCompleted = (stage) => {
    return getStageStatus(stage) === 'Completed';
  };

  return (
    <div className="flying-operations">
      {/* Header */}
      <div className="ops-header">
        <div className="ops-header-content">
          <div className="ops-title-section">
            <h1>
              <span className="ops-title-icon"><FaPlane /></span>
              Flying Operations
            </h1>
            <p className="ops-subtitle">Complete three-stage aircraft operation workflow</p>
          </div>
          <div className="aircraft-badge">
            <p className="aircraft-badge-title">Current Aircraft</p>
            <p className="aircraft-badge-value">
              {selectedAircraft?.aircraft_number} • {selectedAircraft?.model}
            </p>
          </div>
        </div>
      </div>

      {/* Alert Messages */}
      {alert.message && (
        <div className={`alert ${alert.type}`}>
          <div className="alert-icon">
            {alert.type === 'success' && <FaCheckCircle />}
            {alert.type === 'error' && <FaExclamationTriangle />}
            {alert.type === 'warning' && <FaExclamationTriangle />}
            {alert.type === 'info' && <FaInfoCircle />}
          </div>
          <div className="alert-content">
            <p className="alert-message">{alert.message}</p>
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="timeline-container">
        <div className="timeline">
          {stages.map((stage) => (
            <div
              key={stage.id}
              className={`timeline-step ${
                currentStage === stage.id ? 'active' : ''
              } ${isStageCompleted(stage.id) ? 'completed' : ''} ${
                !canAccessStage(stage.id) ? 'locked' : ''
              }`}
              onClick={() => canAccessStage(stage.id) && setCurrentStage(stage.id)}
            >
              <div className="step-circle">
                {isStageCompleted(stage.id) ? <FaCheckCircle /> : stage.icon}
              </div>
              <div className="step-info">
                <p className="step-number">Step {stage.id + 1}</p>
                <h3 className="step-title">{stage.short}</h3>
                <p className="step-status">{getStageStatus(stage.id)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stage Content */}
      <div className="stage-content">
        {/* Stage 0: Before Flying Service */}
        {currentStage === 0 && (
          <>
            {!bfsRecord ? (
              <div className="content-card">
                <div className="card-header">
                  <h2 className="card-title">
                    <span className="card-title-icon"><FaTools /></span>
                    Aircraft Preparation
                  </h2>
                  <span className="card-badge">Step 1/3</span>
                </div>

                <div className="form-section">
                  <div className="section-header">
                    <h3 className="section-title">
                      <FaTachometerAlt /> Aircraft Parameters
                    </h3>
                    <p className="section-subtitle">Record initial aircraft readings before service</p>
                  </div>

                  <div className="form-grid">
                    <div className="form-field">
                      <label className="field-label">
                        <FaGasPump /> Fuel Level <span className="required-mark">*</span>
                      </label>
                      <input
                        type="number"
                        className="field-input"
                        value={fuelLevel}
                        onChange={(e) => setFuelLevel(e.target.value)}
                        placeholder="Enter fuel level in liters"
                      />
                    </div>
                    <div className="form-field">
                      <label className="field-label">
                        Main Tire Pressure <span className="required-mark">*</span>
                      </label>
                      <input
                        type="number"
                        className="field-input"
                        value={tirePressureMain}
                        onChange={(e) => setTirePressureMain(e.target.value)}
                        placeholder="PSI"
                      />
                    </div>
                    <div className="form-field">
                      <label className="field-label">
                        Nose Tire Pressure <span className="required-mark">*</span>
                      </label>
                      <input
                        type="number"
                        className="field-input"
                        value={tirePressureNose}
                        onChange={(e) => setTirePressureNose(e.target.value)}
                        placeholder="PSI"
                      />
                    </div>
                  </div>

                  <div className="checkbox-field" onClick={() => setSupervisorRequired(!supervisorRequired)}>
                    <input
                      type="checkbox"
                      checked={supervisorRequired}
                      onChange={(e) => setSupervisorRequired(e.target.checked)}
                    />
                    <span className="checkbox-label">Supervisor Signature Required</span>
                  </div>

                  <div className="form-field">
                    <label className="field-label">Remarks</label>
                    <textarea
                      className="field-input"
                      value={bfsRemarks}
                      onChange={(e) => setBfsRemarks(e.target.value)}
                      placeholder="Enter any additional remarks or notes..."
                    />
                  </div>

                  <button className="btn btn-primary btn-lg" onClick={handleCreateBFS} disabled={loading}>
                    <FaChevronRight className="btn-icon" />
                    {loading ? 'Creating Record...' : 'Create BFS Record'}
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Tradesmen Signatures */}
                <div className="content-card">
                  <div className="card-header">
                    <h2 className="card-title">
                      <span className="card-title-icon"><FaUser /></span>
                      Tradesman Signatures
                    </h2>
                  </div>

                  <div className="progress-indicator">
                    <div className="progress-header">
                      <span className="progress-title">Completion Progress</span>
                      <span className="progress-percentage">{getTradesmanProgress()}%</span>
                    </div>
                    <div className="progress-bar-container">
                      <div className="progress-bar-fill" style={{ width: `${getTradesmanProgress()}%` }} />
                    </div>
                  </div>

                  <div className="signatures-grid">
                    {tradesmen.map((trade) => (
                      <div
                        key={trade.key}
                        className={`signature-card ${bfsRecord[`${trade.key}_signed_at`] ? 'signed' : 'pending'}`}
                      >
                        <div className="signature-header">
                          <div className="signature-role">
                            <div className={`role-avatar ${trade.key}`}>
                              {trade.short}
                            </div>
                            <div className="role-info">
                              <h4>{trade.title}</h4>
                              <p className="role-description">{trade.short}</p>
                            </div>
                          </div>
                          {bfsRecord[`${trade.key}_signed_at`] && (
                            <FaCheckCircle className="signature-status-icon" />
                          )}
                        </div>

                        {!bfsRecord[`${trade.key}_signed_at`] ? (
                          <div className="signature-form">
                            <div className="pin-input-group">
                              <input
                                type="password"
                                className="pin-input"
                                placeholder="Enter PIN"
                                value={tradePins[trade.key]}
                                onChange={(e) => setTradePins({ ...tradePins, [trade.key]: e.target.value })}
                              />
                              <button
                                className="btn btn-sm btn-primary"
                                onClick={() => handleTradesmanSign(trade.key)}
                                disabled={loading}
                              >
                                <FaLock /> Sign
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="signature-details">
                            <div className="detail-row">
                              <span className="detail-label">Signed by:</span>
                              <span className="detail-value">{bfsRecord[`${trade.key}_name`] || user.full_name}</span>
                            </div>
                            <p className="detail-timestamp">
                              {new Date(bfsRecord[`${trade.key}_signed_at`]).toLocaleString()}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Supervisor Signature */}
                {supervisorRequired && (
                  <div className="content-card supervisor-card">
                    <div className="card-header">
                      <h2 className="card-title">
                        <span className="card-title-icon"><FaUserShield /></span>
                        Supervisor Approval
                      </h2>
                    </div>

                    <div className={`signature-card ${bfsRecord.supervisor_signed_at ? 'signed' : 'pending'}`}>
                      <div className="signature-header">
                        <div className="signature-role">
                          <div className="role-avatar supervisor">SUP</div>
                          <div className="role-info">
                            <h4>Supervisor</h4>
                            <p className="role-description">Oversight & Approval</p>
                          </div>
                        </div>
                        {bfsRecord.supervisor_signed_at && (
                          <FaCheckCircle className="signature-status-icon" />
                        )}
                      </div>

                      {!bfsRecord.supervisor_signed_at ? (
                        <div className="signature-form">
                          <div className="pin-input-group">
                            <input
                              type="password"
                              className="pin-input"
                              placeholder="Enter Supervisor PIN"
                              value={supervisorPin}
                              onChange={(e) => setSupervisorPin(e.target.value)}
                            />
                            <button
                              className="btn btn-primary"
                              onClick={handleSupervisorSign}
                              disabled={loading}
                            >
                              <FaLock /> Sign as Supervisor
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="signature-details">
                          <div className="detail-row">
                            <span className="detail-label">Signed by:</span>
                            <span className="detail-value">{bfsRecord.supervisor_name || user.full_name}</span>
                          </div>
                          <p className="detail-timestamp">
                            {new Date(bfsRecord.supervisor_signed_at).toLocaleString()}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* FSI Approval */}
                <div className="content-card fsi-approval-card">
                  <div className="card-header">
                    <h2 className="card-title">
                      <span className="card-title-icon"><FaUserShield /></span>
                      FSI Final Approval
                    </h2>
                  </div>

                  {!bfsRecord.fsi_signed_at ? (
                    <>
                      <div className="warning-box">
                        <FaExclamationTriangle className="warning-icon" />
                        <p className="warning-text">
                          FSI approval is <strong>required</strong> to proceed to Pilot Acceptance stage.
                          Ensure all tradesman signatures are collected before FSI approval.
                        </p>
                      </div>

                      <div className="signature-card pending">
                        <div className="signature-header">
                          <div className="signature-role">
                            <div className="role-avatar fsi">FSI</div>
                            <div className="role-info">
                              <h4>Flight Safety Inspector</h4>
                              <p className="role-description">Final Safety Approval</p>
                            </div>
                          </div>
                        </div>

                        <div className="signature-form">
                          <div className="pin-input-group">
                            <input
                              type="password"
                              className="pin-input"
                              placeholder="Enter FSI PIN"
                              value={fsiPin}
                              onChange={(e) => setFsiPin(e.target.value)}
                            />
                            <button
                              className="btn btn-success btn-lg"
                              onClick={handleFSISign}
                              disabled={loading}
                            >
                              <FaCheckCircle className="btn-icon" />
                              Approve & Unlock Next Stage
                            </button>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="completion-card">
                      <FaCheckCircle className="completion-icon" />
                      <h3 className="completion-title">FSI Approved!</h3>
                      <p className="completion-message">
                        Before Flying Service completed successfully
                      </p>
                      <div className="signature-details">
                        <div className="detail-row">
                          <span className="detail-label">Approved by:</span>
                          <span className="detail-value">{bfsRecord.fsi_name || user.full_name}</span>
                        </div>
                        <p className="detail-timestamp">
                          {new Date(bfsRecord.fsi_signed_at).toLocaleString()}
                        </p>
                      </div>
                      <button className="btn btn-primary btn-lg" onClick={() => setCurrentStage(1)}>
                        <FaChevronRight className="btn-icon" />
                        Proceed to Pilot Acceptance
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </>
        )}

        {/* Stage 1: Pilot Acceptance */}
        {currentStage === 1 && canAccessStage(1) && (
          <>
            {!pilotAcceptance ? (
              <div className="content-card">
                <div className="card-header">
                  <h2 className="card-title">
                    <span className="card-title-icon"><FaClipboardCheck /></span>
                    Pre-Flight Inspection
                  </h2>
                  <span className="card-badge">Step 2/3</span>
                </div>

                <div className="form-section">
                  <div className="section-header">
                    <h3 className="section-title">
                      <FaCheckCircle /> Safety Checks
                    </h3>
                    <p className="section-subtitle">Complete all pre-flight safety checks</p>
                  </div>

                  <div className="progress-indicator">
                    <div className="progress-header">
                      <span className="progress-title">Checklist Progress</span>
                      <span className="progress-percentage">{getChecklistProgress()}%</span>
                    </div>
                    <div className="progress-bar-container">
                      <div className="progress-bar-fill" style={{ width: `${getChecklistProgress()}%` }} />
                    </div>
                  </div>

                  <div className="checklist-grid">
                    {Object.keys(pilotChecks).map((check) => (
                      <div
                        key={check}
                        className={`checklist-item ${pilotChecks[check] ? 'checked' : ''}`}
                        onClick={() => setPilotChecks({ ...pilotChecks, [check]: !pilotChecks[check] })}
                      >
                        <input
                          type="checkbox"
                          className="checklist-checkbox"
                          checked={pilotChecks[check]}
                          onChange={(e) => setPilotChecks({ ...pilotChecks, [check]: e.target.checked })}
                        />
                        <span className="checklist-label">
                          {check.replace(/_/g, ' ').replace(/check/g, '').toUpperCase()}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="section-header" style={{ marginTop: '2rem' }}>
                    <h3 className="section-title">
                      <FaTachometerAlt /> Current Readings
                    </h3>
                    <p className="section-subtitle">Record current aircraft parameters</p>
                  </div>

                  <div className="form-grid">
                    <div className="form-field">
                      <label className="field-label">
                        <FaGasPump /> Current Fuel Level <span className="required-mark">*</span>
                      </label>
                      <input
                        type="number"
                        className="field-input"
                        value={currentReadings.current_fuel_level}
                        onChange={(e) => setCurrentReadings({ ...currentReadings, current_fuel_level: e.target.value })}
                        placeholder="Liters"
                      />
                    </div>
                    <div className="form-field">
                      <label className="field-label">
                        Current Main Tire Pressure <span className="required-mark">*</span>
                      </label>
                      <input
                        type="number"
                        className="field-input"
                        value={currentReadings.current_tire_pressure_main}
                        onChange={(e) => setCurrentReadings({ ...currentReadings, current_tire_pressure_main: e.target.value })}
                        placeholder="PSI"
                      />
                    </div>
                    <div className="form-field">
                      <label className="field-label">
                        Current Nose Tire Pressure <span className="required-mark">*</span>
                      </label>
                      <input
                        type="number"
                        className="field-input"
                        value={currentReadings.current_tire_pressure_nose}
                        onChange={(e) => setCurrentReadings({ ...currentReadings, current_tire_pressure_nose: e.target.value })}
                        placeholder="PSI"
                      />
                    </div>
                  </div>

                  <div className="form-field">
                    <label className="field-label">Remarks</label>
                    <textarea
                      className="field-input"
                      value={acceptanceRemarks}
                      onChange={(e) => setAcceptanceRemarks(e.target.value)}
                      placeholder="Enter any additional remarks or observations..."
                    />
                  </div>

                  <button className="btn btn-primary btn-lg" onClick={handleCreatePilotAcceptance} disabled={loading}>
                    <FaChevronRight className="btn-icon" />
                    {loading ? 'Creating Record...' : 'Create Acceptance Record'}
                  </button>
                </div>
              </div>
            ) : !pilotAcceptance.pilot_signed_at ? (
              <div className="content-card">
                <div className="card-header">
                  <h2 className="card-title">
                    <span className="card-title-icon"><FaUserShield /></span>
                    Pilot Signature Required
                  </h2>
                </div>

                <div className="info-box">
                  <FaInfoCircle className="info-icon" />
                  <p className="info-text">
                    Review all parameters and safety checks. Provide your PIN to accept the aircraft and proceed to flight operations.
                  </p>
                </div>

                <div className="signature-card pending">
                  <div className="signature-header">
                    <div className="signature-role">
                      <div className="role-avatar pilot">PLT</div>
                      <div className="role-info">
                        <h4>Pilot Acceptance</h4>
                        <p className="role-description">Aircraft Commander</p>
                      </div>
                    </div>
                  </div>

                  <div className="signature-form">
                    <div className="pin-input-group">
                      <input
                        type="password"
                        className="pin-input"
                        placeholder="Enter Pilot PIN"
                        value={pilotPin}
                        onChange={(e) => setPilotPin(e.target.value)}
                      />
                      <button
                        className="btn btn-success btn-lg"
                        onClick={handlePilotSign}
                        disabled={loading}
                      >
                        <FaCheckCircle className="btn-icon" />
                        Accept Aircraft
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="content-card">
                <div className="completion-card">
                  <FaCheckCircle className="completion-icon" />
                  <h3 className="completion-title">Aircraft Accepted!</h3>
                  <p className="completion-message">
                    Pre-flight inspection completed successfully
                  </p>
                  <div className="signature-details">
                    <div className="detail-row">
                      <span className="detail-label">Accepted by:</span>
                      <span className="detail-value">{pilotAcceptance.pilot_name || user.full_name}</span>
                    </div>
                    <p className="detail-timestamp">
                      {new Date(pilotAcceptance.pilot_signed_at).toLocaleString()}
                    </p>
                  </div>
                  <button className="btn btn-primary btn-lg" onClick={() => setCurrentStage(2)}>
                    <FaChevronRight className="btn-icon" />
                    Proceed to Post Flying
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Stage 2: Post Flying */}
        {currentStage === 2 && canAccessStage(2) && (
          <>
            {!postFlying ? (
              <div className="content-card">
                <div className="card-header">
                  <h2 className="card-title">
                    <span className="card-title-icon"><FaClock /></span>
                    Post-Flight Report
                  </h2>
                  <span className="card-badge">Step 3/3</span>
                </div>

                <div className="form-section">
                  <div className="section-header">
                    <h3 className="section-title">
                      <FaPlane /> Flight Details
                    </h3>
                    <p className="section-subtitle">Record flight operation data</p>
                  </div>

                  <div className="form-grid">
                    <div className="form-field">
                      <label className="field-label">
                        <FaClock /> Flight Hours <span className="required-mark">*</span>
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        className="field-input"
                        value={flightHours}
                        onChange={(e) => setFlightHours(e.target.value)}
                        placeholder="Hours"
                      />
                    </div>
                    <div className="form-field">
                      <label className="field-label">
                        <FaGasPump /> Fuel Consumed <span className="required-mark">*</span>
                      </label>
                      <input
                        type="number"
                        className="field-input"
                        value={fuelConsumed}
                        onChange={(e) => setFuelConsumed(e.target.value)}
                        placeholder="Liters"
                      />
                    </div>
                    <div className="form-field">
                      <label className="field-label">
                        <FaGasPump /> Fuel Level After <span className="required-mark">*</span>
                      </label>
                      <input
                        type="number"
                        className="field-input"
                        value={fuelLevelAfter}
                        onChange={(e) => setFuelLevelAfter(e.target.value)}
                        placeholder="Liters"
                      />
                    </div>
                  </div>

                  <div className="section-header" style={{ marginTop: '2rem' }}>
                    <h3 className="section-title">
                      <FaCog /> Post-Flight Inspection
                    </h3>
                    <p className="section-subtitle">Record aircraft condition after flight</p>
                  </div>

                  <div className="form-grid">
                    <div className="form-field">
                      <label className="field-label">Main Tire Pressure After</label>
                      <input
                        type="number"
                        className="field-input"
                        value={tirePressureMainAfter}
                        onChange={(e) => setTirePressureMainAfter(e.target.value)}
                        placeholder="PSI"
                      />
                    </div>
                    <div className="form-field">
                      <label className="field-label">Nose Tire Pressure After</label>
                      <input
                        type="number"
                        className="field-input"
                        value={tirePressureNoseAfter}
                        onChange={(e) => setTirePressureNoseAfter(e.target.value)}
                        placeholder="PSI"
                      />
                    </div>
                    <div className="form-field">
                      <label className="field-label">Engine Condition</label>
                      <input
                        type="text"
                        className="field-input"
                        value={engineCondition}
                        onChange={(e) => setEngineCondition(e.target.value)}
                        placeholder="e.g., Good, Fair, Needs Attention"
                      />
                    </div>
                  </div>

                  <div className="form-field">
                    <label className="field-label">Issues Found</label>
                    <textarea
                      className="field-input"
                      value={issuesFound}
                      onChange={(e) => setIssuesFound(e.target.value)}
                      placeholder="Describe any issues found during or after flight..."
                    />
                  </div>

                  <div className="checkbox-field" onClick={() => setDefectsReported(!defectsReported)}>
                    <input
                      type="checkbox"
                      checked={defectsReported}
                      onChange={(e) => setDefectsReported(e.target.checked)}
                    />
                    <span className="checkbox-label">Defects Reported</span>
                  </div>

                  <div className="form-field">
                    <label className="field-label">Remarks</label>
                    <textarea
                      className="field-input"
                      value={postFlyingRemarks}
                      onChange={(e) => setPostFlyingRemarks(e.target.value)}
                      placeholder="Enter any additional remarks..."
                    />
                  </div>

                  <button className="btn btn-primary btn-lg" onClick={handleCreatePostFlying} disabled={loading}>
                    <FaChevronRight className="btn-icon" />
                    {loading ? 'Creating Record...' : 'Create Post-Flight Record'}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="content-card">
                  <div className="card-header">
                    <h2 className="card-title">
                      <span className="card-title-icon"><FaUser /></span>
                      Required Signatures
                    </h2>
                  </div>

                  <div className="signatures-grid">
                    {/* Pilot Signature */}
                    <div className={`signature-card ${postFlying.pilot_signed_at ? 'signed' : 'pending'}`}>
                      <div className="signature-header">
                        <div className="signature-role">
                          <div className="role-avatar pilot">PLT</div>
                          <div className="role-info">
                            <h4>Pilot</h4>
                            <p className="role-description">Flight Commander</p>
                          </div>
                        </div>
                        {postFlying.pilot_signed_at && (
                          <FaCheckCircle className="signature-status-icon" />
                        )}
                      </div>

                      {!postFlying.pilot_signed_at ? (
                        <div className="signature-form">
                          <div className="pin-input-group">
                            <input
                              type="password"
                              className="pin-input"
                              placeholder="Enter Pilot PIN"
                              value={postFlyingPilotPin}
                              onChange={(e) => setPostFlyingPilotPin(e.target.value)}
                            />
                            <button
                              className="btn btn-sm btn-primary"
                              onClick={handlePostFlyingPilotSign}
                              disabled={loading}
                            >
                              <FaLock /> Sign
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="signature-details">
                          <div className="detail-row">
                            <span className="detail-label">Signed by:</span>
                            <span className="detail-value">{postFlying.pilot_name || user.full_name}</span>
                          </div>
                          <p className="detail-timestamp">
                            {new Date(postFlying.pilot_signed_at).toLocaleString()}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Engineer Signature */}
                    <div className={`signature-card ${postFlying.engineer_signed_at ? 'signed' : 'pending'}`}>
                      <div className="signature-header">
                        <div className="signature-role">
                          <div className="role-avatar engineer">ENG</div>
                          <div className="role-info">
                            <h4>Engineer</h4>
                            <p className="role-description">Final Verification</p>
                          </div>
                        </div>
                        {postFlying.engineer_signed_at && (
                          <FaCheckCircle className="signature-status-icon" />
                        )}
                      </div>

                      {!postFlying.engineer_signed_at ? (
                        <div className="signature-form">
                          <div className="info-box" style={{ marginBottom: '1rem' }}>
                            <FaInfoCircle className="info-icon" />
                            <p className="info-text">
                              Engineer signature completes the operation and updates aircraft data
                            </p>
                          </div>
                          <div className="pin-input-group">
                            <input
                              type="password"
                              className="pin-input"
                              placeholder="Enter Engineer PIN"
                              value={engineerPin}
                              onChange={(e) => setEngineerPin(e.target.value)}
                            />
                            <button
                              className="btn btn-success"
                              onClick={handleEngineerSign}
                              disabled={loading}
                            >
                              <FaCheckCircle className="btn-icon" />
                              Sign & Complete
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="signature-details">
                          <div className="detail-row">
                            <span className="detail-label">Signed by:</span>
                            <span className="detail-value">{postFlying.engineer_name || user.full_name}</span>
                          </div>
                          <p className="detail-timestamp">
                            {new Date(postFlying.engineer_signed_at).toLocaleString()}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {postFlying.engineer_signed_at && (
                    <div className="completion-card" style={{ marginTop: '2rem' }}>
                      <FaCheckCircle className="completion-icon" />
                      <h3 className="completion-title">Flight Operation Completed!</h3>
                      <p className="completion-message">
                        All stages completed successfully. Aircraft data has been updated.
                      </p>
                      <div className="completion-details">
                        <div className="completion-detail">
                          <FaClock className="detail-icon" />
                          <p className="detail-title">Flight Hours</p>
                          <p className="detail-info">{postFlying.flight_hours} hrs</p>
                        </div>
                        <div className="completion-detail">
                          <FaGasPump className="detail-icon" />
                          <p className="detail-title">Fuel Consumed</p>
                          <p className="detail-info">{postFlying.fuel_consumed} L</p>
                        </div>
                        <div className="completion-detail">
                          <FaCheckCircle className="detail-icon" />
                          <p className="detail-title">Status</p>
                          <p className="detail-info">Completed</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default FlyingOperations;
