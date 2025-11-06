import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  FaPlane, FaCheckCircle, FaUserShield, FaClock, FaGasPump, FaUser,
  FaLock, FaChevronRight, FaTools, FaClipboardCheck, FaExclamationTriangle,
  FaInfoCircle, FaTachometerAlt, FaCog, FaTimes, FaUsers, FaEye
} from 'react-icons/fa';
import './FlyingOperations.css';

const FlyingOperations = () => {
  const { selectedAircraft } = useAuth();
  const navigate = useNavigate();

  const [currentStage, setCurrentStage] = useState(0);
  const [bfsRecord, setBfsRecord] = useState(null);
  const [pilotAcceptance, setPilotAcceptance] = useState(null);
  const [postFlying, setPostFlying] = useState(null);

  // FSI Initial Auth State
  const [fsiInitialPin, setFsiInitialPin] = useState('');

  // Personnel Selection State
  const [showPersonnelModal, setShowPersonnelModal] = useState(false);
  const [availablePersonnel, setAvailablePersonnel] = useState([]);
  const [selectedPersonnel, setSelectedPersonnel] = useState({
    ae: '', al: '', ao: '', ar: '', se: '', supervisor: ''
  });
  const [supervisorRequired, setSupervisorRequired] = useState(false);

  // BFS State
  const [fuelLevel, setFuelLevel] = useState('');
  const [tirePressureMain, setTirePressureMain] = useState('');
  const [tirePressureNose, setTirePressureNose] = useState('');
  const [bfsRemarks, setBfsRemarks] = useState('');

  // Tradesman signatures
  const [tradePins, setTradePins] = useState({
    ae: '', al: '', ao: '', ar: '', se: ''
  });
  const [supervisorPin, setSupervisorPin] = useState('');

  // FSI Review & Approval State
  const [showFSIReview, setShowFSIReview] = useState(false);
  const [fsiPin, setFsiPin] = useState('');

  // Pilot Acceptance State
  const [showBFSDataView, setShowBFSDataView] = useState(false);
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
  const [flightStatus, setFlightStatus] = useState('');
  const [flightHours, setFlightHours] = useState('');
  const [numberOfLandings, setNumberOfLandings] = useState('');
  const [terminationReason, setTerminationReason] = useState('');
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

  const fetchAvailablePersonnel = async () => {
    try {
      const response = await axios.get('/api/before-flying-service/available_personnel/');
      setAvailablePersonnel(response.data);
    } catch (error) {
      console.error('Error fetching personnel:', error);
      showAlert('error', 'Failed to fetch available personnel');
    }
  };

  const showAlert = (type, message) => {
    setAlert({ type, message });
  };

  // FSI Initial Authentication
  const handleCreateInitialBFS = async () => {
    try {
      setLoading(true);
      const response = await axios.post('/api/before-flying-service/', {
        aircraft: selectedAircraft.id,
        status: 'FSI_INITIAL'
      });
      setBfsRecord(response.data);
      showAlert('success', 'BFS record created. Please authenticate as FSI.');
      setLoading(false);
    } catch (error) {
      showAlert('error', error.response?.data?.error || 'Failed to create BFS record');
      setLoading(false);
    }
  };

  const handleFSIInitialAuth = async () => {
    if (!fsiInitialPin) {
      showAlert('error', 'Please enter FSI PIN');
      return;
    }
    try {
      setLoading(true);
      const response = await axios.post(`/api/before-flying-service/${bfsRecord.id}/fsi_initial_auth/`, {
        pin: fsiInitialPin
      });
      setBfsRecord(response.data);
      showAlert('success', 'FSI authenticated successfully! Now select personnel.');
      setFsiInitialPin('');
      await fetchAvailablePersonnel();
      setShowPersonnelModal(true);
      setLoading(false);
    } catch (error) {
      showAlert('error', error.response?.data?.error || 'FSI authentication failed');
      setLoading(false);
    }
  };

  // Personnel Assignment
  const handleAssignPersonnel = async () => {
    if (!selectedPersonnel.ae) {
      showAlert('error', 'At least AE (Air Engineer) must be assigned');
      return;
    }
    try {
      setLoading(true);
      const response = await axios.post(`/api/before-flying-service/${bfsRecord.id}/assign_personnel/`, {
        assigned_ae: selectedPersonnel.ae,
        assigned_al: selectedPersonnel.al || null,
        assigned_ao: selectedPersonnel.ao || null,
        assigned_ar: selectedPersonnel.ar || null,
        assigned_se: selectedPersonnel.se || null,
        assigned_supervisor: selectedPersonnel.supervisor || null,
        supervisor_required: supervisorRequired
      });
      setBfsRecord(response.data);
      setShowPersonnelModal(false);
      showAlert('success', 'Personnel assigned successfully! AE can now enter BFS data.');
      setLoading(false);
    } catch (error) {
      showAlert('error', error.response?.data?.error || 'Failed to assign personnel');
      setLoading(false);
    }
  };

  // BFS Data Entry
  const handleCreateBFS = async () => {
    if (!fuelLevel || !tirePressureMain || !tirePressureNose) {
      showAlert('error', 'Please fill in all aircraft parameters');
      return;
    }
    try {
      setLoading(true);
      const response = await axios.patch(`/api/before-flying-service/${bfsRecord.id}/`, {
        fuel_level_before: fuelLevel,
        tire_pressure_main_before: tirePressureMain,
        tire_pressure_nose_before: tirePressureNose,
        remarks: bfsRemarks
      });
      setBfsRecord(response.data);
      showAlert('success', 'BFS data recorded! Tradesmen can now authenticate their work.');
      setLoading(false);
    } catch (error) {
      showAlert('error', error.response?.data?.error || 'Failed to update BFS record');
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

  // FSI Final Approval
  const handleFSIFinalApproval = async () => {
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
      showAlert('success', 'FSI approved! Aircraft ready for pilot acceptance.');
      setFsiPin('');
      setShowFSIReview(false);
      setCurrentStage(1);
      setLoading(false);
    } catch (error) {
      showAlert('error', error.response?.data?.error || 'Failed to approve');
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
      showAlert('success', 'Aircraft accepted! Pilot acceptance section is now locked.');
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
    if (!flightStatus) {
      showAlert('error', 'Please select flight status (Completed or Terminated)');
      return;
    }
    if (flightStatus === 'TERMINATED' && !terminationReason) {
      showAlert('error', 'Please provide termination reason');
      return;
    }
    if (flightStatus === 'COMPLETED') {
      if (!flightHours || !fuelConsumed || !fuelLevelAfter) {
        showAlert('error', 'Please fill in all required flight details');
        return;
      }
    } else {
      if (!flightHours) {
        showAlert('error', 'Please provide flight hours');
        return;
      }
    }
    try {
      setLoading(true);
      const response = await axios.post('/api/post-flying/', {
        pilot_acceptance: pilotAcceptance.id,
        aircraft: selectedAircraft.id,
        flight_status: flightStatus,
        flight_hours: flightHours,
        number_of_landings: numberOfLandings || 0,
        termination_reason: flightStatus === 'TERMINATED' ? terminationReason : null,
        fuel_consumed: fuelConsumed || null,
        fuel_level_after: fuelLevelAfter || null,
        tire_pressure_main_after: tirePressureMainAfter || null,
        tire_pressure_nose_after: tirePressureNoseAfter || null,
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

  // Start New Operation
  const handleStartNewOperation = () => {
    setBfsRecord(null);
    setPilotAcceptance(null);
    setPostFlying(null);
    setCurrentStage(0);
    setFsiInitialPin('');
    setSelectedPersonnel({ ae: '', al: '', ao: '', ar: '', se: '', supervisor: '' });
    setSupervisorRequired(false);
    setFuelLevel('');
    setTirePressureMain('');
    setTirePressureNose('');
    setBfsRemarks('');
    setTradePins({ ae: '', al: '', ao: '', ar: '', se: '' });
    setSupervisorPin('');
    setFsiPin('');
    setFlightStatus('');
    setFlightHours('');
    setNumberOfLandings('');
    setTerminationReason('');
    setFuelConsumed('');
    setFuelLevelAfter('');
    showAlert('info', 'Starting new flying operation for the same aircraft');
  };

  // Helper Functions
  const getTradesmanProgress = () => {
    if (!bfsRecord || !bfsRecord.personnel_added) return 0;
    let total = 0;
    let signed = 0;
    if (bfsRecord.assigned_ae) {
      total++;
      if (bfsRecord.ae_signed_at) signed++;
    }
    if (bfsRecord.assigned_al) {
      total++;
      if (bfsRecord.al_signed_at) signed++;
    }
    if (bfsRecord.assigned_ao) {
      total++;
      if (bfsRecord.ao_signed_at) signed++;
    }
    if (bfsRecord.assigned_ar) {
      total++;
      if (bfsRecord.ar_signed_at) signed++;
    }
    if (bfsRecord.assigned_se) {
      total++;
      if (bfsRecord.se_signed_at) signed++;
    }
    return total > 0 ? Math.round((signed / total) * 100) : 0;
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

  const isStageCompleted = (stage) => {
    return getStageStatus(stage) === 'Completed';
  };

  // Personnel Modal Component
  const PersonnelModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4" onClick={() => setShowPersonnelModal(false)}>
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="card-header">
          <h2 className="card-title">
            <FaUsers className="card-title-icon" /> Assign Personnel
          </h2>
          <button onClick={() => setShowPersonnelModal(false)} className="text-gray-500 hover:text-red-500 text-2xl p-2">
            <FaTimes />
          </button>
        </div>
        <div className="p-6">
          <p className="section-subtitle mb-6">
            Select tradesmen and supervisor who will service the aircraft. At least AE (Air Engineer) is required.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {['ae', 'al', 'ao', 'ar', 'se'].map((trade) => (
              <div key={trade} className="form-field">
                <label className="field-label">
                  {trade.toUpperCase()} - {trade === 'ae' ? 'Air Engineer' : trade === 'al' ? 'Air Electrical' : trade === 'ao' ? 'Air Ordinance' : trade === 'ar' ? 'Air Radio' : 'Senior Engineer'}
                  {trade === 'ae' && <span className="required-mark"> *</span>}
                </label>
                <select
                  className="field-input"
                  value={selectedPersonnel[trade]}
                  onChange={(e) => setSelectedPersonnel({ ...selectedPersonnel, [trade]: e.target.value })}
                >
                  <option value="">-- Select {trade.toUpperCase()} --</option>
                  {availablePersonnel.map((person) => (
                    <option key={person.id} value={person.id}>
                      {person.pno} - {person.full_name} ({person.rank || 'N/A'})
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
          <div className="checkbox-field">
            <input
              type="checkbox"
              checked={supervisorRequired}
              onChange={(e) => setSupervisorRequired(e.target.checked)}
            />
            <span className="checkbox-label">Supervisor Required</span>
          </div>
          {supervisorRequired && (
            <div className="form-field mb-6">
              <label className="field-label">
                Supervisor <span className="required-mark">*</span>
              </label>
              <select
                className="field-input"
                value={selectedPersonnel.supervisor}
                onChange={(e) => setSelectedPersonnel({ ...selectedPersonnel, supervisor: e.target.value })}
              >
                <option value="">-- Select Supervisor --</option>
                {availablePersonnel.map((person) => (
                  <option key={person.id} value={person.id}>
                    {person.pno} - {person.full_name} ({person.rank || 'N/A'})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
        <div className="p-6 border-t-2 border-gray-200 flex justify-end gap-4">
          <button onClick={() => setShowPersonnelModal(false)} className="btn btn-sm bg-gray-200 text-gray-700 hover:bg-gray-300">
            Cancel
          </button>
          <button onClick={handleAssignPersonnel} disabled={loading} className="btn btn-sm btn-primary">
            <FaCheckCircle /> {loading ? 'Assigning...' : 'Assign Personnel'}
          </button>
        </div>
      </div>
    </div>
  );

  // BFS Data View Component
  const BFSDataView = () => (
    <div className="content-card mb-6">
      <div className="card-header">
        <h3 className="card-title">
          <FaEye className="card-title-icon" /> BFS Data & Personnel Details
        </h3>
        <button
          onClick={() => setShowBFSDataView(!showBFSDataView)}
          className="btn btn-sm bg-gray-200 text-gray-700 hover:bg-gray-300"
        >
          {showBFSDataView ? 'Hide' : 'View'} Details
        </button>
      </div>
      {showBFSDataView && bfsRecord && (
        <div className="space-y-6 mt-6">
          <div className="form-section">
            <h4 className="section-title mb-3 pb-2 border-b-2 border-gray-200">Aircraft Parameters (Before Service)</h4>
            <div className="form-grid grid-cols-3">
              <div>
                <span className="text-sm text-gray-500 font-medium">Fuel Level:</span>
                <p className="text-lg font-bold text-gray-800">{bfsRecord.fuel_level_before || 'N/A'} L</p>
              </div>
              <div>
                <span className="text-sm text-gray-500 font-medium">Main Tire Pressure:</span>
                <p className="text-lg font-bold text-gray-800">{bfsRecord.tire_pressure_main_before || 'N/A'} PSI</p>
              </div>
              <div>
                <span className="text-sm text-gray-500 font-medium">Nose Tire Pressure:</span>
                <p className="text-lg font-bold text-gray-800">{bfsRecord.tire_pressure_nose_before || 'N/A'} PSI</p>
              </div>
            </div>
          </div>
          <div className="form-section">
            <h4 className="section-title mb-3 pb-2 border-b-2 border-gray-200">Assigned Personnel</h4>
            <div className="space-y-2">
              {bfsRecord.assigned_ae && (
                <div className="bg-gray-50 p-3 rounded-lg border-l-4 border-indigo-500">
                  <strong className="text-gray-700">AE:</strong> {bfsRecord.assigned_ae_name} ({bfsRecord.assigned_ae_pno}) - {bfsRecord.assigned_ae_rank}
                </div>
              )}
              {bfsRecord.assigned_al && (
                <div className="bg-gray-50 p-3 rounded-lg border-l-4 border-indigo-500">
                  <strong className="text-gray-700">AL:</strong> {bfsRecord.assigned_al_name} ({bfsRecord.assigned_al_pno}) - {bfsRecord.assigned_al_rank}
                </div>
              )}
              {bfsRecord.assigned_ao && (
                <div className="bg-gray-50 p-3 rounded-lg border-l-4 border-indigo-500">
                  <strong className="text-gray-700">AO:</strong> {bfsRecord.assigned_ao_name} ({bfsRecord.assigned_ao_pno}) - {bfsRecord.assigned_ao_rank}
                </div>
              )}
              {bfsRecord.assigned_ar && (
                <div className="bg-gray-50 p-3 rounded-lg border-l-4 border-indigo-500">
                  <strong className="text-gray-700">AR:</strong> {bfsRecord.assigned_ar_name} ({bfsRecord.assigned_ar_pno}) - {bfsRecord.assigned_ar_rank}
                </div>
              )}
              {bfsRecord.assigned_se && (
                <div className="bg-gray-50 p-3 rounded-lg border-l-4 border-indigo-500">
                  <strong className="text-gray-700">SE:</strong> {bfsRecord.assigned_se_name} ({bfsRecord.assigned_se_pno}) - {bfsRecord.assigned_se_rank}
                </div>
              )}
              {bfsRecord.assigned_supervisor && (
                <div className="bg-gray-50 p-3 rounded-lg border-l-4 border-indigo-500">
                  <strong className="text-gray-700">Supervisor:</strong> {bfsRecord.assigned_supervisor_name} ({bfsRecord.assigned_supervisor_pno}) - {bfsRecord.assigned_supervisor_rank}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="flying-operations">
      {/* Header */}
      <div className="ops-header">
        <div className="ops-header-content">
          <div className="ops-title-section">
            <h1>
              <FaPlane className="ops-title-icon" /> Flying Operations
            </h1>
            <p className="ops-subtitle">Complete three-stage aircraft operation workflow</p>
          </div>
          <div className="aircraft-badge">
            <p className="aircraft-badge-title">Current Aircraft</p>
            <p className="aircraft-badge-value">{selectedAircraft?.aircraft_number} • {selectedAircraft?.model}</p>
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
          <p className="alert-message">{alert.message}</p>
        </div>
      )}

      {/* Personnel Modal */}
      {showPersonnelModal && <PersonnelModal />}

      {/* Timeline */}
      <div className="timeline-container">
        <div className="timeline">
          {stages.map((stage, idx) => (
            <div key={stage.id} className="flex items-center flex-1">
              <div
                onClick={() => canAccessStage(stage.id) && setCurrentStage(stage.id)}
                className={`timeline-step ${
                  currentStage === stage.id ? 'active' : ''
                } ${isStageCompleted(stage.id) ? 'completed' : ''} ${
                  !canAccessStage(stage.id) ? 'locked' : ''
                }`}
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
              {idx < stages.length - 1 && (
                <div className="w-8 h-1 bg-gray-300 mx-2"></div>
              )}
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
                    <FaTools className="card-title-icon" /> Start BFS Process
                  </h2>
                  <span className="card-badge">Step 1/3</span>
                </div>
                <div className="info-box">
                  <FaInfoCircle className="info-icon" />
                  <p className="info-text">
                    Click below to start the Before Flying Service process. FSI will need to authenticate first.
                  </p>
                </div>
                <button
                  onClick={handleCreateInitialBFS}
                  disabled={loading}
                  className="btn btn-primary btn-lg w-full"
                >
                  <FaChevronRight className="btn-icon" /> {loading ? 'Creating...' : 'Start BFS Process'}
                </button>
              </div>
            ) : !bfsRecord.fsi_initial_signed_at ? (
              // FSI Initial Authentication
              <div className="content-card">
                <h2 className="card-title mb-6">
                  <FaUserShield className="card-title-icon" /> FSI Initial Authentication
                </h2>
                <div className="warning-box">
                  <FaExclamationTriangle className="warning-icon" />
                  <p className="warning-text">
                    Flight Safety Inspector must authenticate before personnel can be assigned.
                  </p>
                </div>
                <div className="signature-card fsi-approval-card">
                  <div className="signature-header mb-6">
                    <div className="signature-role">
                      <div className="role-avatar fsi">FSI</div>
                      <div className="role-info">
                        <h4>Flight Safety Inspector</h4>
                        <p className="role-description">Initial Authentication</p>
                      </div>
                    </div>
                  </div>
                  <div className="signature-form">
                    <div className="pin-input-group">
                      <input
                        type="password"
                        placeholder="Enter FSI PIN"
                        value={fsiInitialPin}
                        onChange={(e) => setFsiInitialPin(e.target.value)}
                        className="pin-input"
                      />
                      <button
                        onClick={handleFSIInitialAuth}
                        disabled={loading}
                        className="btn btn-sm btn-success"
                      >
                        <FaCheckCircle /> Authenticate & Continue
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : !bfsRecord.personnel_added ? (
              // Personnel Assignment
              <div className="content-card">
                <h2 className="card-title mb-6">
                  <FaUsers className="card-title-icon" /> Personnel Assignment
                </h2>
                <div className="info-box">
                  <FaInfoCircle className="info-icon" />
                  <p className="info-text">
                    FSI has authenticated. Now assign tradesmen and supervisor who will service the aircraft.
                  </p>
                </div>
                <button
                  onClick={() => {
                    fetchAvailablePersonnel();
                    setShowPersonnelModal(true);
                  }}
                  disabled={loading}
                  className="btn btn-primary btn-lg w-full"
                >
                  <FaUsers /> Select Personnel
                </button>
              </div>
            ) : !bfsRecord.fuel_level_before ? (
              // BFS Data Entry by AE
              <div className="content-card">
                <div className="card-header">
                  <h2 className="card-title">
                    <FaTools className="card-title-icon" /> Aircraft Preparation (AE Entry)
                  </h2>
                  <span className="card-badge">Step 1/3</span>
                </div>
                <div className="info-box">
                  <FaInfoCircle className="info-icon" />
                  <p className="info-text">
                    AE (Air Engineer): {bfsRecord.assigned_ae_name} must enter the aircraft parameters.
                  </p>
                </div>
                <div className="form-section">
                  <h3 className="section-title">
                    <FaTachometerAlt /> Aircraft Parameters
                  </h3>
                  <div className="form-grid grid-cols-3">
                    <div className="form-field">
                      <label className="field-label">
                        <FaGasPump className="inline mr-1" /> Fuel Level <span className="required-mark">*</span>
                      </label>
                      <input
                        type="number"
                        value={fuelLevel}
                        onChange={(e) => setFuelLevel(e.target.value)}
                        placeholder="Enter fuel level in liters"
                        className="field-input"
                      />
                    </div>
                    <div className="form-field">
                      <label className="field-label">
                        Main Tire Pressure <span className="required-mark">*</span>
                      </label>
                      <input
                        type="number"
                        value={tirePressureMain}
                        onChange={(e) => setTirePressureMain(e.target.value)}
                        placeholder="PSI"
                        className="field-input"
                      />
                    </div>
                    <div className="form-field">
                      <label className="field-label">
                        Nose Tire Pressure <span className="required-mark">*</span>
                      </label>
                      <input
                        type="number"
                        value={tirePressureNose}
                        onChange={(e) => setTirePressureNose(e.target.value)}
                        placeholder="PSI"
                        className="field-input"
                      />
                    </div>
                  </div>
                </div>
                <div className="form-section">
                  <label className="field-label">Remarks</label>
                  <textarea
                    value={bfsRemarks}
                    onChange={(e) => setBfsRemarks(e.target.value)}
                    placeholder="Enter any additional remarks or notes..."
                    rows="3"
                    className="field-input"
                  />
                </div>
                <button
                  onClick={handleCreateBFS}
                  disabled={loading}
                  className="btn btn-primary btn-lg w-full"
                >
                  <FaChevronRight className="btn-icon" /> {loading ? 'Saving Data...' : 'Save BFS Data'}
                </button>
              </div>
            ) : (
              <>
                {/* Tradesmen Signatures */}
                <div className="content-card mb-6">
                  <h2 className="card-title mb-6">
                    <FaUser className="card-title-icon" /> Tradesman Signatures
                  </h2>
                  <div className="info-box">
                    <FaInfoCircle className="info-icon" />
                    <p className="info-text">
                      Each assigned tradesman must authenticate their work on this aircraft.
                    </p>
                  </div>
                  <div className="progress-indicator">
                    <div className="progress-header">
                      <span className="progress-title">Completion Progress</span>
                      <span className="progress-percentage">{getTradesmanProgress()}%</span>
                    </div>
                    <div className="progress-bar-container">
                      <div className="progress-bar-fill" style={{ width: `${getTradesmanProgress()}%` }}></div>
                    </div>
                  </div>
                  <div className="signatures-grid">
                    {['ae', 'al', 'ao', 'ar', 'se'].map((trade) => {
                      const assignedUser = bfsRecord[`assigned_${trade}`];
                      if (!assignedUser) return null;
                      return (
                        <div key={trade} className={`signature-card ${bfsRecord[`${trade}_signed_at`] ? 'signed' : 'pending'}`}>
                          <div className="signature-header">
                            <div className="signature-role">
                              <div className={`role-avatar ${trade}`}>
                                {trade.toUpperCase()}
                              </div>
                              <div className="role-info">
                                <h4>{bfsRecord[`assigned_${trade}_name`]}</h4>
                                <p className="role-description">{bfsRecord[`assigned_${trade}_pno`]}</p>
                              </div>
                            </div>
                            {bfsRecord[`${trade}_signed_at`] && (
                              <FaCheckCircle className="signature-status-icon" />
                            )}
                          </div>
                          {!bfsRecord[`${trade}_signed_at`] ? (
                            <div className="signature-form">
                              <div className="pin-input-group">
                                <input
                                  type="password"
                                  placeholder="Enter PIN"
                                  value={tradePins[trade]}
                                  onChange={(e) => setTradePins({ ...tradePins, [trade]: e.target.value })}
                                  className="pin-input"
                                />
                                <button
                                  onClick={() => handleTradesmanSign(trade)}
                                  disabled={loading}
                                  className="btn btn-sm btn-primary"
                                >
                                  <FaLock /> Sign
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="signature-details">
                              <p className="detail-row"><span className="detail-label">Signed by:</span> <span className="detail-value">{bfsRecord[`${trade}_name`]}</span></p>
                              <p className="detail-timestamp">{new Date(bfsRecord[`${trade}_signed_at`]).toLocaleString()}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Supervisor Signature */}
                {bfsRecord.supervisor_required && bfsRecord.assigned_supervisor && (
                  <div className="content-card mb-6">
                    <h2 className="card-title mb-6">
                      <FaUserShield className="card-title-icon" /> Supervisor Approval
                    </h2>
                    <div className={`signature-card supervisor-card ${bfsRecord.supervisor_signed_at ? 'signed' : ''}`}>
                      <div className="signature-header">
                        <div className="signature-role">
                          <div className="role-avatar supervisor">SUP</div>
                          <div className="role-info">
                            <h4>{bfsRecord.assigned_supervisor_name}</h4>
                            <p className="role-description">{bfsRecord.assigned_supervisor_pno}</p>
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
                              placeholder="Enter Supervisor PIN"
                              value={supervisorPin}
                              onChange={(e) => setSupervisorPin(e.target.value)}
                              className="pin-input"
                            />
                            <button
                              onClick={handleSupervisorSign}
                              disabled={loading}
                              className="btn btn-sm btn-primary"
                            >
                              <FaLock /> Sign as Supervisor
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="signature-details">
                          <p className="detail-row"><span className="detail-label">Signed by:</span> <span className="detail-value">{bfsRecord.supervisor_name}</span></p>
                          <p className="detail-timestamp">{new Date(bfsRecord.supervisor_signed_at).toLocaleString()}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* FSI Review & Final Approval */}
                <div className="content-card">
                  <h2 className="card-title mb-6">
                    <FaUserShield className="card-title-icon" /> FSI Review & Final Approval
                  </h2>
                  {!bfsRecord.fsi_signed_at ? (
                    <>
                      <div className="warning-box">
                        <FaExclamationTriangle className="warning-icon" />
                        <p className="warning-text">
                          FSI must review all tradesman work and provide final approval to proceed to Pilot Acceptance.
                        </p>
                      </div>
                      <button
                        onClick={() => setShowFSIReview(!showFSIReview)}
                        className="btn btn-primary w-full mb-4"
                      >
                        <FaEye /> {showFSIReview ? 'Hide' : 'Review'} All Data
                      </button>
                      {showFSIReview && (
                        <div className="content-card bg-gray-50 mb-6 space-y-6">
                          <div className="form-section">
                            <h3 className="section-title">Aircraft Parameters</h3>
                            <div className="form-grid grid-cols-3">
                              <div>
                                <span className="text-sm text-gray-600">Fuel Level:</span>
                                <p className="text-lg font-bold">{bfsRecord.fuel_level_before} L</p>
                              </div>
                              <div>
                                <span className="text-sm text-gray-600">Main Tire Pressure:</span>
                                <p className="text-lg font-bold">{bfsRecord.tire_pressure_main_before} PSI</p>
                              </div>
                              <div>
                                <span className="text-sm text-gray-600">Nose Tire Pressure:</span>
                                <p className="text-lg font-bold">{bfsRecord.tire_pressure_nose_before} PSI</p>
                              </div>
                            </div>
                          </div>
                          <div className="form-section">
                            <h3 className="section-title">Assigned Personnel & Signatures</h3>
                            <div className="space-y-2">
                              {['ae', 'al', 'ao', 'ar', 'se'].map((trade) => {
                                const assignedUser = bfsRecord[`assigned_${trade}`];
                                if (!assignedUser) return null;
                                return (
                                  <div key={trade} className="flex items-center justify-between bg-white p-3 rounded-lg border">
                                    <span>
                                      <strong>{trade.toUpperCase()}:</strong> {bfsRecord[`assigned_${trade}_name`]} ({bfsRecord[`assigned_${trade}_pno`]})
                                    </span>
                                    {bfsRecord[`${trade}_signed_at`] ? (
                                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">✓ Signed</span>
                                    ) : (
                                      <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold">⏳ Pending</span>
                                    )}
                                  </div>
                                );
                              })}
                              {bfsRecord.assigned_supervisor && (
                                <div className="flex items-center justify-between bg-white p-3 rounded-lg border">
                                  <span>
                                    <strong>Supervisor:</strong> {bfsRecord.assigned_supervisor_name} ({bfsRecord.assigned_supervisor_pno})
                                  </span>
                                  {bfsRecord.supervisor_signed_at ? (
                                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">✓ Signed</span>
                                  ) : (
                                    <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold">⏳ Pending</span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                      <div className="signature-card fsi-approval-card">
                        <div className="signature-header mb-6">
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
                              placeholder="Enter FSI PIN"
                              value={fsiPin}
                              onChange={(e) => setFsiPin(e.target.value)}
                              className="pin-input"
                            />
                            <button
                              onClick={handleFSIFinalApproval}
                              disabled={loading}
                              className="btn btn-sm btn-success"
                            >
                              <FaCheckCircle /> Approve & Unlock Next Stage
                            </button>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="completion-card">
                      <FaCheckCircle className="completion-icon" />
                      <h3 className="completion-title">FSI Approved!</h3>
                      <p className="completion-message">Before Flying Service completed successfully</p>
                      <div className="content-card inline-block mb-6">
                        <p className="text-sm text-gray-600">Approved by:</p>
                        <p className="font-bold text-gray-800">{bfsRecord.fsi_name}</p>
                        <p className="text-xs text-gray-500 mt-1">{new Date(bfsRecord.fsi_signed_at).toLocaleString()}</p>
                      </div>
                      <br />
                      <button
                        onClick={() => setCurrentStage(1)}
                        className="btn btn-primary btn-lg"
                      >
                        <FaChevronRight className="btn-icon" /> Proceed to Pilot Acceptance
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
            {bfsRecord && <BFSDataView />}
            {!pilotAcceptance ? (
              <div className="content-card">
                <div className="card-header">
                  <h2 className="card-title">
                    <FaClipboardCheck className="card-title-icon" /> Pre-Flight Inspection
                  </h2>
                  <span className="card-badge">Step 2/3</span>
                </div>
                <div className="form-section">
                  <h3 className="section-title">
                    <FaCheckCircle /> Safety Checks
                  </h3>
                  <div className="progress-indicator mb-4">
                    <div className="progress-header">
                      <span className="progress-title">Checklist Progress</span>
                      <span className="progress-percentage">{getChecklistProgress()}%</span>
                    </div>
                    <div className="progress-bar-container">
                      <div className="progress-bar-fill" style={{ width: `${getChecklistProgress()}%` }}></div>
                    </div>
                  </div>
                  <div className="checklist-grid">
                    {Object.keys(pilotChecks).map((check) => (
                      <div
                        key={check}
                        onClick={() => setPilotChecks({ ...pilotChecks, [check]: !pilotChecks[check] })}
                        className={`checklist-item ${pilotChecks[check] ? 'checked' : ''}`}
                      >
                        <input
                          type="checkbox"
                          checked={pilotChecks[check]}
                          onChange={(e) => setPilotChecks({ ...pilotChecks, [check]: e.target.checked })}
                          className="checklist-checkbox"
                        />
                        <span className="checklist-label">
                          {check.replace(/_/g, ' ').replace(/check/g, '').toUpperCase()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="form-section">
                  <h3 className="section-title">
                    <FaTachometerAlt /> Current Readings
                  </h3>
                  <div className="form-grid grid-cols-3">
                    <div className="form-field">
                      <label className="field-label">
                        <FaGasPump className="inline mr-1" /> Current Fuel Level <span className="required-mark">*</span>
                      </label>
                      <input
                        type="number"
                        value={currentReadings.current_fuel_level}
                        onChange={(e) => setCurrentReadings({ ...currentReadings, current_fuel_level: e.target.value })}
                        placeholder="Liters"
                        className="field-input"
                      />
                    </div>
                    <div className="form-field">
                      <label className="field-label">
                        Current Main Tire Pressure <span className="required-mark">*</span>
                      </label>
                      <input
                        type="number"
                        value={currentReadings.current_tire_pressure_main}
                        onChange={(e) => setCurrentReadings({ ...currentReadings, current_tire_pressure_main: e.target.value })}
                        placeholder="PSI"
                        className="field-input"
                      />
                    </div>
                    <div className="form-field">
                      <label className="field-label">
                        Current Nose Tire Pressure <span className="required-mark">*</span>
                      </label>
                      <input
                        type="number"
                        value={currentReadings.current_tire_pressure_nose}
                        onChange={(e) => setCurrentReadings({ ...currentReadings, current_tire_pressure_nose: e.target.value })}
                        placeholder="PSI"
                        className="field-input"
                      />
                    </div>
                  </div>
                </div>
                <div className="form-section">
                  <label className="field-label">Remarks</label>
                  <textarea
                    value={acceptanceRemarks}
                    onChange={(e) => setAcceptanceRemarks(e.target.value)}
                    placeholder="Enter any additional remarks or observations..."
                    rows="3"
                    className="field-input"
                  />
                </div>
                <button
                  onClick={handleCreatePilotAcceptance}
                  disabled={loading}
                  className="btn btn-primary btn-lg w-full"
                >
                  <FaChevronRight className="btn-icon" /> {loading ? 'Creating Record...' : 'Create Acceptance Record'}
                </button>
              </div>
            ) : !pilotAcceptance.pilot_signed_at ? (
              <div className="content-card">
                <h2 className="card-title mb-6">
                  <FaUserShield className="card-title-icon" /> Pilot Signature Required
                </h2>
                <div className="info-box">
                  <FaInfoCircle className="info-icon" />
                  <p className="info-text">
                    Review all parameters and safety checks. Provide your PIN to accept the aircraft and proceed to flight operations.
                    Once signed, this section will be locked.
                  </p>
                </div>
                <div className="signature-card">
                  <div className="signature-header mb-6">
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
                        placeholder="Enter Pilot PIN"
                        value={pilotPin}
                        onChange={(e) => setPilotPin(e.target.value)}
                        className="pin-input"
                      />
                      <button
                        onClick={handlePilotSign}
                        disabled={loading}
                        className="btn btn-sm btn-success"
                      >
                        <FaCheckCircle /> Accept Aircraft & Lock Section
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="completion-card">
                <FaCheckCircle className="completion-icon" />
                <h3 className="completion-title">Aircraft Accepted & Locked!</h3>
                <p className="completion-message">Pre-flight inspection completed successfully. This section is now locked.</p>
                <div className="content-card inline-block mb-6">
                  <p className="text-sm text-gray-600">Accepted by:</p>
                  <p className="font-bold text-gray-800">{pilotAcceptance.pilot_name}</p>
                  <p className="text-xs text-gray-500 mt-1">{new Date(pilotAcceptance.pilot_signed_at).toLocaleString()}</p>
                </div>
                <br />
                <button
                  onClick={() => setCurrentStage(2)}
                  className="btn btn-primary btn-lg"
                >
                  <FaChevronRight className="btn-icon" /> Proceed to Post Flying
                </button>
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
                    <FaClock className="card-title-icon" /> Post-Flight Report
                  </h2>
                  <span className="card-badge">Step 3/3</span>
                </div>
                <div className="form-section">
                  <h3 className="section-title">
                    <FaPlane /> Flight Status
                  </h3>
                  <p className="section-subtitle mb-4">Select whether the flight was completed or terminated</p>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setFlightStatus('COMPLETED')}
                      className={`p-6 border-4 rounded-xl transition-all flex flex-col items-center gap-3 ${
                        flightStatus === 'COMPLETED'
                          ? 'border-green-500 bg-green-50 shadow-lg'
                          : 'border-gray-300 bg-white hover:border-green-300'
                      }`}
                    >
                      <FaCheckCircle className={`text-5xl ${flightStatus === 'COMPLETED' ? 'text-green-600' : 'text-gray-400'}`} />
                      <span className="font-bold text-lg">Completed</span>
                    </button>
                    <button
                      onClick={() => setFlightStatus('TERMINATED')}
                      className={`p-6 border-4 rounded-xl transition-all flex flex-col items-center gap-3 ${
                        flightStatus === 'TERMINATED'
                          ? 'border-yellow-500 bg-yellow-50 shadow-lg'
                          : 'border-gray-300 bg-white hover:border-yellow-300'
                      }`}
                    >
                      <FaExclamationTriangle className={`text-5xl ${flightStatus === 'TERMINATED' ? 'text-yellow-600' : 'text-gray-400'}`} />
                      <span className="font-bold text-lg">Terminated</span>
                    </button>
                  </div>
                </div>

                {flightStatus === 'TERMINATED' && (
                  <div className="form-section">
                    <label className="field-label">
                      Termination Reason <span className="required-mark">*</span>
                    </label>
                    <textarea
                      value={terminationReason}
                      onChange={(e) => setTerminationReason(e.target.value)}
                      placeholder="Explain why the flight was terminated..."
                      rows="3"
                      className="field-input"
                    />
                  </div>
                )}

                <div className="form-section">
                  <h3 className="section-title">
                    <FaPlane /> Flight Details
                  </h3>
                  <div className="form-grid">
                    <div className="form-field">
                      <label className="field-label">
                        <FaClock className="inline mr-1" /> Flight Hours <span className="required-mark">*</span>
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={flightHours}
                        onChange={(e) => setFlightHours(e.target.value)}
                        placeholder="Hours"
                        className="field-input"
                      />
                    </div>
                    <div className="form-field">
                      <label className="field-label">
                        Number of Landings
                      </label>
                      <input
                        type="number"
                        value={numberOfLandings}
                        onChange={(e) => setNumberOfLandings(e.target.value)}
                        placeholder="Number of landings"
                        className="field-input"
                      />
                    </div>
                    {flightStatus === 'COMPLETED' && (
                      <>
                        <div className="form-field">
                          <label className="field-label">
                            <FaGasPump className="inline mr-1" /> Fuel Consumed <span className="required-mark">*</span>
                          </label>
                          <input
                            type="number"
                            value={fuelConsumed}
                            onChange={(e) => setFuelConsumed(e.target.value)}
                            placeholder="Liters"
                            className="field-input"
                          />
                        </div>
                        <div className="form-field">
                          <label className="field-label">
                            <FaGasPump className="inline mr-1" /> Fuel Level After <span className="required-mark">*</span>
                          </label>
                          <input
                            type="number"
                            value={fuelLevelAfter}
                            onChange={(e) => setFuelLevelAfter(e.target.value)}
                            placeholder="Liters"
                            className="field-input"
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {flightStatus === 'COMPLETED' && (
                  <>
                    <div className="form-section">
                      <h3 className="section-title">
                        <FaCog /> Post-Flight Inspection
                      </h3>
                      <div className="form-grid grid-cols-3">
                        <div className="form-field">
                          <label className="field-label">Main Tire Pressure After</label>
                          <input
                            type="number"
                            value={tirePressureMainAfter}
                            onChange={(e) => setTirePressureMainAfter(e.target.value)}
                            placeholder="PSI"
                            className="field-input"
                          />
                        </div>
                        <div className="form-field">
                          <label className="field-label">Nose Tire Pressure After</label>
                          <input
                            type="number"
                            value={tirePressureNoseAfter}
                            onChange={(e) => setTirePressureNoseAfter(e.target.value)}
                            placeholder="PSI"
                            className="field-input"
                          />
                        </div>
                        <div className="form-field">
                          <label className="field-label">Engine Condition</label>
                          <input
                            type="text"
                            value={engineCondition}
                            onChange={(e) => setEngineCondition(e.target.value)}
                            placeholder="e.g., Good, Fair, Needs Attention"
                            className="field-input"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="form-section">
                      <label className="field-label">Issues Found</label>
                      <textarea
                        value={issuesFound}
                        onChange={(e) => setIssuesFound(e.target.value)}
                        placeholder="Describe any issues found during or after flight..."
                        rows="3"
                        className="field-input"
                      />
                    </div>
                    <div className="checkbox-field">
                      <input
                        type="checkbox"
                        checked={defectsReported}
                        onChange={(e) => setDefectsReported(e.target.checked)}
                      />
                      <span className="checkbox-label">Defects Reported</span>
                    </div>
                  </>
                )}

                <div className="form-section">
                  <label className="field-label">Remarks</label>
                  <textarea
                    value={postFlyingRemarks}
                    onChange={(e) => setPostFlyingRemarks(e.target.value)}
                    placeholder="Enter any additional remarks..."
                    rows="3"
                    className="field-input"
                  />
                </div>

                <button
                  onClick={handleCreatePostFlying}
                  disabled={loading}
                  className="btn btn-primary btn-lg w-full"
                >
                  <FaChevronRight className="btn-icon" /> {loading ? 'Creating Record...' : 'Create Post-Flight Record'}
                </button>
              </div>
            ) : (
              <>
                <div className="content-card">
                  <h2 className="card-title mb-6">
                    <FaUser className="card-title-icon" /> Required Signatures
                  </h2>
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
                              placeholder="Enter Pilot PIN"
                              value={postFlyingPilotPin}
                              onChange={(e) => setPostFlyingPilotPin(e.target.value)}
                              className="pin-input"
                            />
                            <button
                              onClick={handlePostFlyingPilotSign}
                              disabled={loading}
                              className="btn btn-sm btn-primary"
                            >
                              <FaLock /> Sign
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="signature-details">
                          <p className="detail-row"><span className="detail-label">Signed by:</span> <span className="detail-value">{postFlying.pilot_name}</span></p>
                          <p className="detail-timestamp">{new Date(postFlying.pilot_signed_at).toLocaleString()}</p>
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
                        <>
                          <div className="info-box text-xs mb-4">
                            <FaInfoCircle className="info-icon" />
                            <p className="info-text">Engineer signature completes the operation and updates aircraft data</p>
                          </div>
                          <div className="signature-form">
                            <div className="pin-input-group">
                              <input
                                type="password"
                                placeholder="Enter Engineer PIN"
                                value={engineerPin}
                                onChange={(e) => setEngineerPin(e.target.value)}
                                className="pin-input"
                              />
                              <button
                                onClick={handleEngineerSign}
                                disabled={loading}
                                className="btn btn-sm btn-success"
                              >
                                <FaCheckCircle /> Sign & Complete
                              </button>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="signature-details">
                          <p className="detail-row"><span className="detail-label">Signed by:</span> <span className="detail-value">{postFlying.engineer_name}</span></p>
                          <p className="detail-timestamp">{new Date(postFlying.engineer_signed_at).toLocaleString()}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {postFlying.engineer_signed_at && (
                    <div className="completion-card mt-8">
                      <FaCheckCircle className="completion-icon" />
                      <h3 className="completion-title">
                        Flight Operation {postFlying.flight_status === 'TERMINATED' ? 'Terminated' : 'Completed'}!
                      </h3>
                      <p className="completion-message">
                        All stages completed successfully.
                        {postFlying.flight_status === 'COMPLETED' && ' Aircraft data has been updated.'}
                      </p>
                      <div className="completion-details max-w-3xl mx-auto mb-8">
                        <div className="completion-detail">
                          <FaClock className="detail-icon" />
                          <p className="detail-title">Flight Hours</p>
                          <p className="detail-info">{postFlying.flight_hours} hrs</p>
                        </div>
                        <div className="completion-detail">
                          <FaPlane className="detail-icon" />
                          <p className="detail-title">Landings</p>
                          <p className="detail-info">{postFlying.number_of_landings}</p>
                        </div>
                        {postFlying.flight_status === 'COMPLETED' && (
                          <div className="completion-detail">
                            <FaGasPump className="detail-icon" />
                            <p className="detail-title">Fuel Consumed</p>
                            <p className="detail-info">{postFlying.fuel_consumed} L</p>
                          </div>
                        )}
                        <div className="completion-detail">
                          <FaCheckCircle className="detail-icon" />
                          <p className="detail-title">Status</p>
                          <p className="detail-info">{postFlying.flight_status === 'TERMINATED' ? 'Terminated' : 'Completed'}</p>
                        </div>
                      </div>
                      <button
                        onClick={handleStartNewOperation}
                        className="btn btn-primary btn-lg"
                      >
                        <FaPlane /> Start New Flying Operation
                      </button>
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
