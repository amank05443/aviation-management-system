import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  FaPlane, FaCheckCircle, FaUserShield, FaLock,
  FaChevronRight, FaTools, FaClipboardCheck, FaExclamationTriangle,
  FaInfoCircle, FaUsers, FaSearch
} from 'react-icons/fa';
import PilotAcceptance from './PilotAcceptance';
import PostFlying from './PostFlying';
import './FlyingOperations.css';

const FlyingOperations = () => {
  const { selectedAircraft } = useAuth();
  const navigate = useNavigate();

  // Hardcoded personnel database
  const PERSONNEL_DATABASE = {
    'AE001': { pno: 'AE001', name: 'Rajesh Kumar', rank: 'Sergeant', trade: 'AE', pin: '1111' },
    'AE002': { pno: 'AE002', name: 'Amit Singh', rank: 'Corporal', trade: 'AE', pin: '1112' },
    'AE003': { pno: 'AE003', name: 'Pradeep Sharma', rank: 'LAC', trade: 'AE', pin: '1113' },
    'AE004': { pno: 'AE004', name: 'Ravi Shankar', rank: 'Corporal', trade: 'AE', pin: '1114' },
    'AE005': { pno: 'AE005', name: 'Karan Mehta', rank: 'Sergeant', trade: 'AE', pin: '1115' },
    'AL001': { pno: 'AL001', name: 'Suresh Verma', rank: 'Corporal', trade: 'AL', pin: '2222' },
    'AL002': { pno: 'AL002', name: 'Vikram Rao', rank: 'LAC', trade: 'AL', pin: '2223' },
    'AL003': { pno: 'AL003', name: 'Naveen Singh', rank: 'Corporal', trade: 'AL', pin: '2224' },
    'AL004': { pno: 'AL004', name: 'Sanjay Kumar', rank: 'LAC', trade: 'AL', pin: '2225' },
    'AL005': { pno: 'AL005', name: 'Manish Gupta', rank: 'Sergeant', trade: 'AL', pin: '2226' },
    'AR001': { pno: 'AR001', name: 'Manoj Sharma', rank: 'Corporal', trade: 'AR', pin: '3333' },
    'AR002': { pno: 'AR002', name: 'Deepak Joshi', rank: 'LAC', trade: 'AR', pin: '3334' },
    'AR003': { pno: 'AR003', name: 'Arun Reddy', rank: 'Corporal', trade: 'AR', pin: '3335' },
    'AR004': { pno: 'AR004', name: 'Bharat Tiwari', rank: 'LAC', trade: 'AR', pin: '3336' },
    'AR005': { pno: 'AR005', name: 'Chandan Yadav', rank: 'Sergeant', trade: 'AR', pin: '3337' },
    'AO001': { pno: 'AO001', name: 'Rahul Gupta', rank: 'Corporal', trade: 'AO', pin: '4444' },
    'AO002': { pno: 'AO002', name: 'Ajay Patel', rank: 'LAC', trade: 'AO', pin: '4445' },
    'AO003': { pno: 'AO003', name: 'Dinesh Nair', rank: 'Corporal', trade: 'AO', pin: '4446' },
    'AO004': { pno: 'AO004', name: 'Ganesh Pillai', rank: 'LAC', trade: 'AO', pin: '4447' },
    'AO005': { pno: 'AO005', name: 'Harish Iyer', rank: 'Sergeant', trade: 'AO', pin: '4448' },
    'SUP001': { pno: 'SUP001', name: 'Vijay Reddy', rank: 'JWO', trade: 'SUP', pin: '9999' },
    'SUP002': { pno: 'SUP002', name: 'Anil Kumar', rank: 'Sergeant', trade: 'SUP', pin: '9998' },
    'SUP003': { pno: 'SUP003', name: 'Prakash Jain', rank: 'JWO', trade: 'SUP', pin: '9997' },
    'SUP004': { pno: 'SUP004', name: 'Mohan Das', rank: 'Warrant Officer', trade: 'SUP', pin: '9996' },
    'SUP005': { pno: 'SUP005', name: 'Ramesh Babu', rank: 'JWO', trade: 'SUP', pin: '9995' },
  };

  const FSI_PIN = '1234';
  const PILOT_PIN = '5678';
  const ENGINEER_PIN = '7890';

  // Main stages
  const [currentStage, setCurrentStage] = useState(0);

  // Flying Operations sub-steps
  const [flyingOpsSubStep, setFlyingOpsSubStep] = useState(0);

  // Sub-step 1: FSI Authentication & Assignment
  const [fsiPin, setFsiPin] = useState('');
  const [fsiAuthenticated, setFsiAuthenticated] = useState(false);
  const [selectedTrades, setSelectedTrades] = useState([]);
  const [assignedPersonnel, setAssignedPersonnel] = useState({});
  const [supervisorPno, setSupervisorPno] = useState('');
  const [searchPno, setSearchPno] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [searchSuggestions, setSearchSuggestions] = useState([]);

  // Sub-step 2: Tradesmen Work
  const [tradesmenSignatures, setTradesmenSignatures] = useState({});
  const [tradesmenPins, setTradesmenPins] = useState({});
  const [aeData, setAeData] = useState({ fuelQty: '', tyrePressure: '', oilFilled: '' });
  const [aeAuthenticated, setAeAuthenticated] = useState(false);
  const [aeAuthPin, setAeAuthPin] = useState('');

  // Sub-step 3: FSI Review
  const [reviewPin, setReviewPin] = useState('');

  // Pilot Acceptance
  const [pilotPin, setPilotPin] = useState('');

  // Post Flying - Enhanced Workflow
  const [flightStatus, setFlightStatus] = useState(''); // 'completed', 'terminated', 'not_flown'
  const [defectStatus, setDefectStatus] = useState(''); // 'with_defect', 'no_defect'
  const [flightData, setFlightData] = useState({ landings: '', airframeHours: '' });
  const [postPilotPin, setPostPilotPin] = useState('');
  const [pilotDataAuthenticated, setPilotDataAuthenticated] = useState(false);

  // AFS (After Flying Servicing) Workflow
  const [afsStage, setAfsStage] = useState(0); // 0: FSI assign, 1: Work completion, 2: Complete
  const [afsFsiPin, setAfsFsiPin] = useState('');
  const [afsFsiAuthenticated, setAfsFsiAuthenticated] = useState(false);
  const [afsSelectedTrades, setAfsSelectedTrades] = useState([]);
  const [afsAssignedPersonnel, setAfsAssignedPersonnel] = useState({});
  const [afsSupervisorPno, setAfsSupervisorPno] = useState('');
  const [afsSearchPno, setAfsSearchPno] = useState('');
  const [afsSearchResults, setAfsSearchResults] = useState(null);
  const [afsSearchSuggestions, setAfsSearchSuggestions] = useState([]);
  const [afsTradesmenSignatures, setAfsTradesmenSignatures] = useState({});
  const [afsTradesmenPins, setAfsTradesmenPins] = useState({});

  const [alert, setAlert] = useState({ type: '', message: '' });

  const showAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert({ type: '', message: '' }), 3000);
  };

  // Toggle trade selection
  const toggleTrade = (trade) => {
    if (selectedTrades.includes(trade)) {
      setSelectedTrades(selectedTrades.filter(t => t !== trade));
      const newAssigned = { ...assignedPersonnel };
      delete newAssigned[trade];
      setAssignedPersonnel(newAssigned);
    } else {
      setSelectedTrades([...selectedTrades, trade]);
    }
  };

  // Live search suggestions as user types
  const handleSearchInput = (value) => {
    setSearchPno(value);

    if (value.trim().length < 2) {
      setSearchSuggestions([]);
      return;
    }

    const searchTerm = value.toLowerCase();
    const matches = Object.values(PERSONNEL_DATABASE).filter(p =>
      p.pno.toLowerCase().includes(searchTerm) ||
      p.name.toLowerCase().includes(searchTerm)
    ).slice(0, 5); // Show max 5 suggestions

    setSearchSuggestions(matches);
  };

  // Select from suggestions
  const handleSelectSuggestion = (person) => {
    setSearchPno(person.pno);
    setSearchResults(person);
    setSearchSuggestions([]);
    showAlert('success', `Selected: ${person.name}`);
  };

  // Search personnel by PNO or Name
  const handleSearchPersonnel = () => {
    const searchTerm = searchPno.toLowerCase();

    // First try to find by PNO
    let person = PERSONNEL_DATABASE[searchPno.toUpperCase()];

    // If not found by PNO, search by name
    if (!person) {
      person = Object.values(PERSONNEL_DATABASE).find(p =>
        p.name.toLowerCase().includes(searchTerm)
      );
    }

    if (person) {
      setSearchResults(person);
      setSearchSuggestions([]);
      showAlert('success', `Found: ${person.name}`);
    } else {
      setSearchResults(null);
      showAlert('error', 'Personnel not found');
    }
  };

  // Assign personnel to trade
  const handleAssignToTrade = (trade) => {
    if (searchResults && searchResults.trade === trade) {
      setAssignedPersonnel({ ...assignedPersonnel, [trade]: searchResults });
      setSearchPno('');
      setSearchResults(null);
      showAlert('success', `${searchResults.name} assigned to ${trade}`);
    } else {
      showAlert('error', `This personnel is not ${trade} trade`);
    }
  };

  // FSI Authentication
  const handleFSIAuth = () => {
    if (!fsiPin.trim()) {
      showAlert('error', 'Please enter FSI PIN');
      return;
    }
    if (fsiPin === FSI_PIN) {
      setFsiAuthenticated(true);
      showAlert('success', 'FSI authenticated successfully! You can now assign work.');
    } else {
      showAlert('error', 'Invalid FSI PIN. Please check and try again.');
    }
  };

  // Complete Assignment
  const handleCompleteAssignment = () => {
    if (selectedTrades.length === 0) {
      showAlert('error', 'Error: No trades selected. Please select at least one trade (AE, AL, AR, or AO).');
      return;
    }

    const unassignedTrades = selectedTrades.filter(trade => !assignedPersonnel[trade]);
    if (unassignedTrades.length > 0) {
      showAlert('error', `Error: ${unassignedTrades.join(', ')} not assigned. Please search and assign personnel to all selected trades.`);
      return;
    }

    if (!supervisorPno.trim()) {
      showAlert('error', 'Error: Supervisor not assigned. Please enter a valid supervisor PNO.');
      return;
    }

    const supervisor = PERSONNEL_DATABASE[supervisorPno.toUpperCase()];
    if (!supervisor) {
      showAlert('error', `Error: Supervisor PNO "${supervisorPno}" not found in database. Please enter a valid supervisor PNO.`);
      return;
    }

    if (supervisor.trade !== 'SUP') {
      showAlert('error', `Error: ${supervisor.name} is not a supervisor. Please assign a personnel with SUP trade.`);
      return;
    }

    setFlyingOpsSubStep(1);
    showAlert('success', `Success! Work assigned to ${selectedTrades.join(', ')} and Supervisor ${supervisor.name}. Tradesmen can now complete their work.`);
  };

  // Tradesman Sign
  const handleTradesmanSign = (trade) => {
    const pin = tradesmenPins[trade];
    const person = assignedPersonnel[trade];

    if (!pin || !pin.trim()) {
      showAlert('error', `Error: Please enter PIN for ${person.name} (${trade}).`);
      return;
    }

    if (person && person.pin === pin) {
      setTradesmenSignatures({ ...tradesmenSignatures, [trade]: person });
      showAlert('success', `Success! ${person.name} (${trade}) signed their work completion.`);
      setTradesmenPins({ ...tradesmenPins, [trade]: '' });
    } else {
      showAlert('error', `Error: Invalid PIN for ${person.name}. Expected PIN: ${person.pin}`);
    }
  };

  // Check if all tradesmen signed
  const allTradesmenSigned = () => {
    return selectedTrades.every(trade => tradesmenSignatures[trade]);
  };

  // Supervisor Sign
  const handleSupervisorSign = () => {
    const supervisor = PERSONNEL_DATABASE[supervisorPno.toUpperCase()];
    const pin = tradesmenPins['supervisor'];

    if (!pin || !pin.trim()) {
      showAlert('error', `Error: Please enter supervisor PIN for ${supervisor.name}.`);
      return;
    }

    if (supervisor && supervisor.pin === pin) {
      setTradesmenSignatures({ ...tradesmenSignatures, supervisor });
      showAlert('success', `Success! Supervisor ${supervisor.name} has signed and verified all work.`);
      setTradesmenPins({ ...tradesmenPins, supervisor: '' });
    } else {
      showAlert('error', `Error: Invalid PIN for supervisor ${supervisor.name}. Expected PIN: ${supervisor.pin}`);
    }
  };

  // Move to FSI Review
  const handleMoveToReview = () => {
    const unsignedTrades = selectedTrades.filter(trade => !tradesmenSignatures[trade]);

    if (unsignedTrades.length > 0) {
      showAlert('error', `Error: ${unsignedTrades.join(', ')} have not signed yet. All assigned tradesmen must sign before proceeding.`);
      return;
    }

    if (!tradesmenSignatures.supervisor) {
      showAlert('error', 'Error: Supervisor has not signed yet. Supervisor signature is required before FSI review.');
      return;
    }

    if (selectedTrades.includes('AE') && !aeAuthenticated) {
      showAlert('error', 'Error: AE must fill and authenticate all aircraft data before proceeding to FSI review.');
      return;
    }

    if (selectedTrades.includes('AE') && (!aeData.fuelQty || !aeData.tyrePressure || !aeData.oilFilled)) {
      showAlert('error', 'Error: AE must fill all aircraft data fields (Fuel Quantity, Tyre Pressure, Oil Filled).');
      return;
    }

    setFlyingOpsSubStep(2);
    showAlert('success', 'All work completed! Proceeding to FSI review.');
  };

  // FSI Forward to Pilot
  const handleFSIForward = () => {
    if (!reviewPin.trim()) {
      showAlert('error', 'Error: Please enter FSI PIN to forward the work to Pilot.');
      return;
    }

    if (reviewPin === FSI_PIN) {
      setCurrentStage(1);
      setReviewPin('');
      showAlert('success', 'Success! Flying Operations completed and forwarded to Pilot Acceptance.');
    } else {
      showAlert('error', 'Error: Invalid FSI PIN. Please check and try again.');
    }
  };

  // Pilot Accept
  const handlePilotAccept = () => {
    if (pilotPin === PILOT_PIN) {
      setCurrentStage(2);
      showAlert('success', 'Aircraft accepted! Proceeding to Post Flying.');
      setPilotPin('');
    } else {
      showAlert('error', 'Invalid Pilot PIN');
    }
  };

  // Post Flying - Select Flight Status
  const handleFlightStatusSelect = (status) => {
    setFlightStatus(status);
    setDefectStatus('');
    showAlert('info', `Flight status selected: ${status.replace('_', ' ').toUpperCase()}`);
  };

  // Post Flying - Select Defect Status
  const handleDefectStatusSelect = (status) => {
    setDefectStatus(status);
    showAlert('info', `Defect status selected: ${status.replace('_', ' ').toUpperCase()}`);
  };

  // Post Flying - Pilot Data Authentication
  const handlePilotDataAuth = () => {
    if (!flightData.landings || !flightData.airframeHours) {
      showAlert('error', 'Please fill all flight data fields (Number of Landings and Airframe Hours)');
      return;
    }

    if (!postPilotPin.trim()) {
      showAlert('error', 'Please enter Pilot PIN to authenticate');
      return;
    }

    if (postPilotPin === PILOT_PIN) {
      setPilotDataAuthenticated(true);
      showAlert('success', 'Flight data authenticated! Aircraft ready for AFS (After Flying Servicing)');
      setPostPilotPin('');
    } else {
      showAlert('error', 'Invalid Pilot PIN');
    }
  };

  // AFS - FSI Authentication
  const handleAFSFsiAuth = () => {
    if (!afsFsiPin.trim()) {
      showAlert('error', 'Please enter FSI PIN');
      return;
    }
    if (afsFsiPin === FSI_PIN) {
      setAfsFsiAuthenticated(true);
      showAlert('success', 'FSI authenticated! You can now assign AFS workforce.');
    } else {
      showAlert('error', 'Invalid FSI PIN');
    }
  };

  // AFS - Toggle trade selection
  const toggleAfsTrade = (trade) => {
    if (afsSelectedTrades.includes(trade)) {
      setAfsSelectedTrades(afsSelectedTrades.filter(t => t !== trade));
      const newAssigned = { ...afsAssignedPersonnel };
      delete newAssigned[trade];
      setAfsAssignedPersonnel(newAssigned);
    } else {
      setAfsSelectedTrades([...afsSelectedTrades, trade]);
    }
  };

  // AFS - Live search suggestions
  const handleAfsSearchInput = (value) => {
    setAfsSearchPno(value);

    if (value.trim().length < 2) {
      setAfsSearchSuggestions([]);
      return;
    }

    const searchTerm = value.toLowerCase();
    const matches = Object.values(PERSONNEL_DATABASE).filter(p =>
      p.pno.toLowerCase().includes(searchTerm) ||
      p.name.toLowerCase().includes(searchTerm)
    ).slice(0, 5);

    setAfsSearchSuggestions(matches);
  };

  // AFS - Select from suggestions
  const handleAfsSelectSuggestion = (person) => {
    setAfsSearchPno(person.pno);
    setAfsSearchResults(person);
    setAfsSearchSuggestions([]);
    showAlert('success', `Selected: ${person.name}`);
  };

  // AFS - Search personnel
  const handleAfsSearchPersonnel = () => {
    const searchTerm = afsSearchPno.toLowerCase();
    let person = PERSONNEL_DATABASE[afsSearchPno.toUpperCase()];

    if (!person) {
      person = Object.values(PERSONNEL_DATABASE).find(p =>
        p.name.toLowerCase().includes(searchTerm)
      );
    }

    if (person) {
      setAfsSearchResults(person);
      setAfsSearchSuggestions([]);
      showAlert('success', `Found: ${person.name}`);
    } else {
      setAfsSearchResults(null);
      showAlert('error', 'Personnel not found');
    }
  };

  // AFS - Assign personnel to trade
  const handleAfsAssignToTrade = (trade) => {
    if (afsSearchResults && afsSearchResults.trade === trade) {
      setAfsAssignedPersonnel({ ...afsAssignedPersonnel, [trade]: afsSearchResults });
      setAfsSearchPno('');
      setAfsSearchResults(null);
      showAlert('success', `${afsSearchResults.name} assigned to ${trade} for AFS`);
    } else {
      showAlert('error', `This personnel is not ${trade} trade`);
    }
  };

  // AFS - Complete Assignment
  const handleAfsCompleteAssignment = () => {
    if (afsSelectedTrades.length === 0) {
      showAlert('error', 'No trades selected for AFS');
      return;
    }

    const unassignedTrades = afsSelectedTrades.filter(trade => !afsAssignedPersonnel[trade]);
    if (unassignedTrades.length > 0) {
      showAlert('error', `${unassignedTrades.join(', ')} not assigned`);
      return;
    }

    if (!afsSupervisorPno.trim()) {
      showAlert('error', 'Supervisor not assigned');
      return;
    }

    const supervisor = PERSONNEL_DATABASE[afsSupervisorPno.toUpperCase()];
    if (!supervisor || supervisor.trade !== 'SUP') {
      showAlert('error', 'Invalid supervisor PNO');
      return;
    }

    setAfsStage(1);
    showAlert('success', 'AFS work assigned! Tradesmen can now complete their work.');
  };

  // AFS - Tradesman Sign
  const handleAfsTradesmanSign = (trade) => {
    const pin = afsTradesmenPins[trade];
    const person = afsAssignedPersonnel[trade];

    if (!pin || !pin.trim()) {
      showAlert('error', `Please enter PIN for ${person.name}`);
      return;
    }

    if (person && person.pin === pin) {
      setAfsTradesmenSignatures({ ...afsTradesmenSignatures, [trade]: person });
      showAlert('success', `${person.name} signed AFS work completion`);
      setAfsTradesmenPins({ ...afsTradesmenPins, [trade]: '' });
    } else {
      showAlert('error', `Invalid PIN for ${person.name}`);
    }
  };

  // AFS - Supervisor Sign
  const handleAfsSupervisorSign = () => {
    const supervisor = PERSONNEL_DATABASE[afsSupervisorPno.toUpperCase()];
    const pin = afsTradesmenPins['supervisor'];

    if (!pin || !pin.trim()) {
      showAlert('error', `Please enter supervisor PIN`);
      return;
    }

    if (supervisor && supervisor.pin === pin) {
      setAfsTradesmenSignatures({ ...afsTradesmenSignatures, supervisor });
      showAlert('success', `Supervisor ${supervisor.name} signed AFS completion`);
      setAfsTradesmenPins({ ...afsTradesmenPins, supervisor: '' });
    } else {
      showAlert('error', `Invalid PIN for supervisor`);
    }
  };

  // AFS - Complete AFS
  const handleCompleteAfs = () => {
    const unsignedTrades = afsSelectedTrades.filter(trade => !afsTradesmenSignatures[trade]);

    if (unsignedTrades.length > 0) {
      showAlert('error', `${unsignedTrades.join(', ')} have not signed yet`);
      return;
    }

    if (!afsTradesmenSignatures.supervisor) {
      showAlert('error', 'Supervisor has not signed yet');
      return;
    }

    setAfsStage(2);
    showAlert('success', 'AFS Completed! Flight operation cycle complete.');
  };

  // AE Authentication (after filling data)
  const handleAeAuth = () => {
    const aePerson = assignedPersonnel['AE'];

    if (!aeData.fuelQty || !aeData.tyrePressure || !aeData.oilFilled) {
      showAlert('error', 'Error: Please fill all aircraft data fields (Fuel Quantity, Tyre Pressure, and Oil Filled) before authenticating.');
      return;
    }

    if (!aeAuthPin.trim()) {
      showAlert('error', 'Error: Please enter AE PIN to confirm the data.');
      return;
    }

    if (aePerson && aePerson.pin === aeAuthPin) {
      setAeAuthenticated(true);
      showAlert('success', `Success! ${aePerson.name} authenticated. Aircraft data confirmed and locked.`);
      setAeAuthPin('');
    } else {
      showAlert('error', `Error: Invalid PIN for ${aePerson.name}. Please check the PIN and try again.`);
    }
  };

  // Reset
  const handleReset = () => {
    setCurrentStage(0);
    setFlyingOpsSubStep(0);
    setFsiPin('');
    setFsiAuthenticated(false);
    setSelectedTrades([]);
    setAssignedPersonnel({});
    setSupervisorPno('');
    setSearchPno('');
    setSearchResults(null);
    setTradesmenSignatures({});
    setTradesmenPins({});
    setAeData({ fuelQty: '', tyrePressure: '', oilFilled: '' });
    setAeAuthenticated(false);
    setAeAuthPin('');
    setReviewPin('');
    setPilotPin('');
    setFlightStatus('');
    setDefectStatus('');
    setFlightData({ landings: '', airframeHours: '' });
    setPostPilotPin('');
    setPilotDataAuthenticated(false);
    setAfsStage(0);
    setAfsFsiPin('');
    setAfsFsiAuthenticated(false);
    setAfsSelectedTrades([]);
    setAfsAssignedPersonnel({});
    setAfsSupervisorPno('');
    setAfsSearchPno('');
    setAfsSearchResults(null);
    setAfsSearchSuggestions([]);
    setAfsTradesmenSignatures({});
    setAfsTradesmenPins({});
    showAlert('info', 'Starting new operation');
  };

  const mainStages = [
    { id: 0, title: 'Flying Operations', icon: <FaTools /> },
    { id: 1, title: 'Pilot Acceptance', icon: <FaUserShield /> },
    { id: 2, title: 'Post Flying', icon: <FaClipboardCheck /> }
  ];

  const flyingOpsSubSteps = [
    { id: 0, title: 'Verify FSI & Assign Work' },
    { id: 1, title: 'Work Done by Tradesmen' },
    { id: 2, title: 'FSI Review & Forward' }
  ];

  if (!selectedAircraft) {
    navigate('/aircraft-selection');
    return null;
  }

  return (
    <div className="flying-operations">
      {/* Alert */}
      {alert.message && (
        <div className={`alert ${alert.type}`}>
          <div className="alert-icon">
            {alert.type === 'success' && <FaCheckCircle />}
            {alert.type === 'error' && <FaExclamationTriangle />}
            {alert.type === 'info' && <FaInfoCircle />}
          </div>
          <p className="alert-message">{alert.message}</p>
        </div>
      )}

      {/* Main Progress */}
      <div className="main-progress">
        {mainStages.map((stage, idx) => {
          const isCompleted = currentStage > stage.id;
          const isActive = currentStage === stage.id;
          const isLocked = currentStage < stage.id;

          return (
            <div key={stage.id} className="progress-item-wrapper">
              <div className={`progress-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''} ${isLocked ? 'locked' : ''}`}>
                <div className="progress-icon">
                  {isCompleted ? <FaCheckCircle /> : isLocked ? <FaLock /> : stage.icon}
                </div>
                <div className="progress-info">
                  <h3>{stage.title}</h3>
                  <p>{isCompleted ? 'Completed' : isActive ? 'Active' : 'Locked'}</p>
                </div>
              </div>
              {idx < mainStages.length - 1 && <div className={`progress-connector ${currentStage > idx ? 'active' : ''}`}></div>}
            </div>
          );
        })}
      </div>

      {/* Content */}
      <div className="ops-content">
        {/* Flying Operations */}
        {currentStage === 0 && (
          <div className="ops-section">
            {/* Sub-steps Progress - Horizontal */}
            <div className="sub-steps-breadcrumb">
              {flyingOpsSubSteps.map((step, idx) => {
                const isCompleted = flyingOpsSubStep > step.id;
                const isActive = flyingOpsSubStep === step.id;
                const isLocked = flyingOpsSubStep < step.id;

                return (
                  <div key={step.id} className="breadcrumb-wrapper">
                    <div className={`breadcrumb-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''} ${isLocked ? 'locked' : ''}`}>
                      <div className="breadcrumb-number">
                        {isCompleted ? <FaCheckCircle /> : isLocked ? <FaLock /> : step.id + 1}
                      </div>
                      <span className="breadcrumb-title">{step.title}</span>
                    </div>
                    {idx < flyingOpsSubSteps.length - 1 && (
                      <FaChevronRight className={`breadcrumb-arrow ${isCompleted ? 'completed' : ''}`} />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Main Content Area */}
            <div className="ops-card">
              {/* Sub-step 1: FSI & Assign */}
              {flyingOpsSubStep === 0 && (
                <div className="ops-card-content">
                  <h2><FaUserShield /> FSI Verification & Work Assignment</h2>

                  {!fsiAuthenticated ? (
                    <div className="auth-box">
                      <p className="hint">FSI PIN: <strong>1234</strong></p>
                      <div className="input-group">
                        <input
                          type="password"
                          placeholder="Enter FSI PIN"
                          value={fsiPin}
                          onChange={(e) => setFsiPin(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleFSIAuth()}
                        />
                        <button onClick={handleFSIAuth} className="btn-primary">
                          <FaCheckCircle /> Authenticate
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="assignment-section">
                      {/* Trade Selection */}
                      <div className="form-group">
                        <label>Select Trades Required:</label>
                        <div className="trade-grid">
                          {['AE', 'AL', 'AR', 'AO'].map(trade => (
                            <div
                              key={trade}
                              className={`trade-card ${selectedTrades.includes(trade) ? 'selected' : ''}`}
                              onClick={() => toggleTrade(trade)}
                            >
                              <div className="trade-name">{trade}</div>
                              {assignedPersonnel[trade] && (
                                <div className="assigned-info">
                                  <FaCheckCircle /> {assignedPersonnel[trade].name}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Personnel Search */}
                      {selectedTrades.length > 0 && (
                        <div className="form-group">
                          <label>Search & Assign Personnel:</label>
                          <div className="search-box-wrapper">
                            <div className="search-box">
                              <input
                                type="text"
                                placeholder="Enter PNO (e.g., AE001) or Name (e.g., Rajesh)"
                                value={searchPno}
                                onChange={(e) => handleSearchInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearchPersonnel()}
                              />
                              <button onClick={handleSearchPersonnel} className="btn-secondary">
                                <FaSearch /> Search
                              </button>
                            </div>

                            {/* Live Suggestions */}
                            {searchSuggestions.length > 0 && (
                              <div className="search-suggestions">
                                {searchSuggestions.map((person) => (
                                  <div
                                    key={person.pno}
                                    className="suggestion-item"
                                    onClick={() => handleSelectSuggestion(person)}
                                  >
                                    <div className="suggestion-badge">{person.trade}</div>
                                    <div className="suggestion-details">
                                      <strong>{person.pno}</strong> - {person.name}
                                      <span className="suggestion-rank">{person.rank}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {searchResults && (
                            <div className="search-result">
                              <div className="personnel-info">
                                <p><strong>PNO:</strong> {searchResults.pno}</p>
                                <p><strong>Name:</strong> {searchResults.name}</p>
                                <p><strong>Rank:</strong> {searchResults.rank}</p>
                                <p><strong>Trade:</strong> {searchResults.trade}</p>
                              </div>
                              {selectedTrades.includes(searchResults.trade) && !assignedPersonnel[searchResults.trade] && (
                                <button
                                  onClick={() => handleAssignToTrade(searchResults.trade)}
                                  className="btn-success"
                                >
                                  Assign to {searchResults.trade}
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Supervisor */}
                      <div className="form-group">
                        <label>Assign Supervisor (PNO):</label>
                        <input
                          type="text"
                          className="supervisor-input"
                          placeholder="Enter Supervisor PNO (e.g., SUP001)"
                          value={supervisorPno}
                          onChange={(e) => setSupervisorPno(e.target.value)}
                        />
                        {supervisorPno && PERSONNEL_DATABASE[supervisorPno.toUpperCase()] && (
                          <p className="supervisor-info">
                            <FaCheckCircle /> {PERSONNEL_DATABASE[supervisorPno.toUpperCase()].name} - {PERSONNEL_DATABASE[supervisorPno.toUpperCase()].rank}
                          </p>
                        )}
                      </div>

                      <button onClick={handleCompleteAssignment} className="btn-primary btn-lg">
                        <FaChevronRight /> Complete Assignment
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Sub-step 2: Tradesmen Work */}
              {flyingOpsSubStep === 1 && (
                <div className="ops-card-content">
                  <h2><FaUsers /> Tradesmen Work Completion</h2>

                  {/* AE Data Entry */}
                  {selectedTrades.includes('AE') && (
                    <div className="ae-data-section">
                      <h3>AE Data Entry</h3>

                      {/* Data Entry Fields - Always visible */}
                      <div className="data-grid">
                        <div className="input-field">
                          <label>Fuel Quantity (Liters): <span className="required-mark">*</span></label>
                          <input
                            type="number"
                            value={aeData.fuelQty}
                            onChange={(e) => setAeData({ ...aeData, fuelQty: e.target.value })}
                            placeholder="Enter fuel quantity"
                            disabled={aeAuthenticated}
                          />
                        </div>
                        <div className="input-field">
                          <label>Tyre Pressure (PSI): <span className="required-mark">*</span></label>
                          <input
                            type="number"
                            value={aeData.tyrePressure}
                            onChange={(e) => setAeData({ ...aeData, tyrePressure: e.target.value })}
                            placeholder="Enter tyre pressure"
                            disabled={aeAuthenticated}
                          />
                        </div>
                        <div className="input-field">
                          <label>Oil Filled (Liters): <span className="required-mark">*</span></label>
                          <input
                            type="number"
                            value={aeData.oilFilled}
                            onChange={(e) => setAeData({ ...aeData, oilFilled: e.target.value })}
                            placeholder="Enter oil filled"
                            disabled={aeAuthenticated}
                          />
                        </div>
                      </div>

                      {/* Authentication Section - Shows after data is filled */}
                      {!aeAuthenticated ? (
                        <div className="ae-auth-box">
                          <p className="ae-auth-message">
                            <FaUserShield /> AE ({assignedPersonnel['AE']?.name}) must authenticate to confirm the data
                          </p>
                          <p className="hint">
                            AE PIN: <strong>{assignedPersonnel['AE']?.pin}</strong>
                          </p>
                          <div className="input-group">
                            <input
                              type="password"
                              placeholder="Enter AE PIN to confirm data"
                              value={aeAuthPin}
                              onChange={(e) => setAeAuthPin(e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && handleAeAuth()}
                            />
                            <button onClick={handleAeAuth} className="btn-primary">
                              <FaCheckCircle /> Confirm Data
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="ae-auth-success">
                          <FaCheckCircle /> Data confirmed and locked by {assignedPersonnel['AE']?.name}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Tradesmen Signatures */}
                  <div className="signatures-grid">
                    {selectedTrades.map(trade => {
                      const person = assignedPersonnel[trade];
                      const signed = tradesmenSignatures[trade];

                      return (
                        <div key={trade} className={`signature-card ${signed ? 'signed' : ''}`}>
                          <div className="signature-header">
                            <div className="person-info">
                              <h4>{trade} - {person.name}</h4>
                              <p>{person.rank} | {person.pno}</p>
                            </div>
                            {signed && <FaCheckCircle className="signed-icon" />}
                          </div>
                          {!signed && (
                            <div className="signature-input">
                              <p className="hint">PIN: <strong>{person.pin}</strong></p>
                              <input
                                type="password"
                                placeholder="Enter PIN"
                                value={tradesmenPins[trade] || ''}
                                onChange={(e) => setTradesmenPins({ ...tradesmenPins, [trade]: e.target.value })}
                                onKeyPress={(e) => e.key === 'Enter' && handleTradesmanSign(trade)}
                              />
                              <button onClick={() => handleTradesmanSign(trade)} className="btn-primary">
                                Sign
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* Supervisor Signature */}
                    {supervisorPno && PERSONNEL_DATABASE[supervisorPno.toUpperCase()] && (
                      <div className={`signature-card ${tradesmenSignatures.supervisor ? 'signed' : ''}`}>
                        <div className="signature-header">
                          <div className="person-info">
                            <h4>Supervisor - {PERSONNEL_DATABASE[supervisorPno.toUpperCase()].name}</h4>
                            <p>{PERSONNEL_DATABASE[supervisorPno.toUpperCase()].rank} | {supervisorPno}</p>
                          </div>
                          {tradesmenSignatures.supervisor && <FaCheckCircle className="signed-icon" />}
                        </div>
                        {!tradesmenSignatures.supervisor && (
                          <div className="signature-input">
                            <p className="hint">PIN: <strong>{PERSONNEL_DATABASE[supervisorPno.toUpperCase()].pin}</strong></p>
                            <input
                              type="password"
                              placeholder="Enter PIN"
                              value={tradesmenPins.supervisor || ''}
                              onChange={(e) => setTradesmenPins({ ...tradesmenPins, supervisor: e.target.value })}
                              onKeyPress={(e) => e.key === 'Enter' && handleSupervisorSign()}
                            />
                            <button onClick={handleSupervisorSign} className="btn-primary">
                              Sign
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <button onClick={handleMoveToReview} className="btn-primary btn-lg">
                    <FaChevronRight /> Proceed to FSI Review
                  </button>
                </div>
              )}

              {/* Sub-step 3: FSI Review */}
              {flyingOpsSubStep === 2 && (
                <div className="ops-card-content">
                  <h2><FaCheckCircle /> FSI Review & Forward</h2>

                  <div className="review-section">
                    <h3>Work Summary</h3>
                    <div className="summary-grid">
                      {selectedTrades.map(trade => (
                        <div key={trade} className="summary-item">
                          <strong>{trade}:</strong> {assignedPersonnel[trade].name} <FaCheckCircle className="text-green" />
                        </div>
                      ))}
                      <div className="summary-item">
                        <strong>Supervisor:</strong> {PERSONNEL_DATABASE[supervisorPno.toUpperCase()].name} <FaCheckCircle className="text-green" />
                      </div>
                    </div>

                    {selectedTrades.includes('AE') && (
                      <div className="ae-summary">
                        <h4>Aircraft Data (AE)</h4>
                        <p>Fuel: {aeData.fuelQty} L | Tyre Pressure: {aeData.tyrePressure} PSI | Oil: {aeData.oilFilled} L</p>
                      </div>
                    )}
                  </div>

                  <div className="forward-section">
                    <p className="hint">FSI PIN: <strong>1234</strong></p>
                    <div className="input-group">
                      <input
                        type="password"
                        placeholder="Enter FSI PIN to forward"
                        value={reviewPin}
                        onChange={(e) => setReviewPin(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleFSIForward()}
                      />
                      <button onClick={handleFSIForward} className="btn-success btn-lg">
                        <FaChevronRight /> Forward to Pilot
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Pilot Acceptance */}
        {currentStage === 1 && (
          <PilotAcceptance
            selectedTrades={selectedTrades}
            assignedPersonnel={assignedPersonnel}
            supervisorPno={supervisorPno}
            PERSONNEL_DATABASE={PERSONNEL_DATABASE}
            aeData={aeData}
            pilotPin={pilotPin}
            setPilotPin={setPilotPin}
            handlePilotAccept={handlePilotAccept}
            PILOT_PIN={PILOT_PIN}
          />
        )}


        {/* Post Flying */}
        {currentStage === 2 && (
          <PostFlying
            flightStatus={flightStatus}
            defectStatus={defectStatus}
            flightData={flightData}
            setFlightData={setFlightData}
            handleFlightStatusSelect={handleFlightStatusSelect}
            handleDefectStatusSelect={handleDefectStatusSelect}
            postPilotPin={postPilotPin}
            setPostPilotPin={setPostPilotPin}
            handlePilotDataAuth={handlePilotDataAuth}
            pilotDataAuthenticated={pilotDataAuthenticated}
            PILOT_PIN={PILOT_PIN}
            afsStage={afsStage}
            afsFsiPin={afsFsiPin}
            setAfsFsiPin={setAfsFsiPin}
            afsFsiAuthenticated={afsFsiAuthenticated}
            handleAFSFsiAuth={handleAFSFsiAuth}
            FSI_PIN={FSI_PIN}
            afsSelectedTrades={afsSelectedTrades}
            toggleAfsTrade={toggleAfsTrade}
            afsAssignedPersonnel={afsAssignedPersonnel}
            afsSearchPno={afsSearchPno}
            handleAfsSearchInput={handleAfsSearchInput}
            handleAfsSearchPersonnel={handleAfsSearchPersonnel}
            afsSearchSuggestions={afsSearchSuggestions}
            handleAfsSelectSuggestion={handleAfsSelectSuggestion}
            afsSearchResults={afsSearchResults}
            handleAfsAssignToTrade={handleAfsAssignToTrade}
            afsSupervisorPno={afsSupervisorPno}
            setAfsSupervisorPno={setAfsSupervisorPno}
            PERSONNEL_DATABASE={PERSONNEL_DATABASE}
            handleAfsCompleteAssignment={handleAfsCompleteAssignment}
            afsTradesmenSignatures={afsTradesmenSignatures}
            afsTradesmenPins={afsTradesmenPins}
            setAfsTradesmenPins={setAfsTradesmenPins}
            handleAfsTradesmanSign={handleAfsTradesmanSign}
            handleAfsSupervisorSign={handleAfsSupervisorSign}
            handleCompleteAfs={handleCompleteAfs}
            handleReset={handleReset}
          />
        )}
      </div>
    </div>
  );
};

export default FlyingOperations;
