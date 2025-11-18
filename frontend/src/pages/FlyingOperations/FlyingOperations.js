import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaCheckCircle, FaUserShield, FaLock,
  FaChevronRight, FaTools, FaClipboardCheck, FaExclamationTriangle,
  FaInfoCircle, FaUsers, FaSearch, FaTimes
} from 'react-icons/fa';
import PilotAcceptance from './PilotAcceptance';
import PostFlying from './PostFlying';

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

  // Main stages
  const [currentStage, setCurrentStage] = useState(0);

  // Flying Operations sub-steps
  const [flyingOpsSubStep, setFlyingOpsSubStep] = useState(0);

  // Sub-step 1: FSI Authentication & Assignment
  const [fsiPin, setFsiPin] = useState('');
  const [fsiAuthenticated, setFsiAuthenticated] = useState(false);
  const [selectedTrades, setSelectedTrades] = useState([]);
  // Changed to support multiple tradesmen per trade
  const [assignedPersonnel, setAssignedPersonnel] = useState({}); // { AE: [person1, person2], AL: [person1] }
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
  const [flightStatus, setFlightStatus] = useState('');
  const [defectStatus, setDefectStatus] = useState('');
  const [flightData, setFlightData] = useState({ landings: '', airframeHours: '' });
  const [postPilotPin, setPostPilotPin] = useState('');
  const [pilotDataAuthenticated, setPilotDataAuthenticated] = useState(false);

  // AFS Workflow
  const [afsStage, setAfsStage] = useState(0);
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
      setAssignedPersonnel({ ...assignedPersonnel, [trade]: [] });
    }
  };

  // Live search suggestions
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
    ).slice(0, 5);
    setSearchSuggestions(matches);
  };

  // Select from suggestions
  const handleSelectSuggestion = (person) => {
    setSearchPno(person.pno);
    setSearchResults(person);
    setSearchSuggestions([]);
    showAlert('success', `Selected: ${person.name}`);
  };

  // Search personnel
  const handleSearchPersonnel = () => {
    const searchTerm = searchPno.toLowerCase();
    let person = PERSONNEL_DATABASE[searchPno.toUpperCase()];
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

  // Assign personnel to trade (now supports multiple)
  const handleAssignToTrade = (trade) => {
    if (searchResults && searchResults.trade === trade) {
      const currentAssigned = assignedPersonnel[trade] || [];
      // Check if already assigned
      if (currentAssigned.some(p => p.pno === searchResults.pno)) {
        showAlert('error', `${searchResults.name} is already assigned to ${trade}`);
        return;
      }
      setAssignedPersonnel({
        ...assignedPersonnel,
        [trade]: [...currentAssigned, searchResults]
      });
      setSearchPno('');
      setSearchResults(null);
      showAlert('success', `${searchResults.name} assigned to ${trade}`);
    } else {
      showAlert('error', `This personnel is not ${trade} trade`);
    }
  };

  // Remove personnel from trade
  const handleRemoveFromTrade = (trade, pno) => {
    const currentAssigned = assignedPersonnel[trade] || [];
    setAssignedPersonnel({
      ...assignedPersonnel,
      [trade]: currentAssigned.filter(p => p.pno !== pno)
    });
    showAlert('info', 'Personnel removed from assignment');
  };

  // FSI Authentication
  const handleFSIAuth = () => {
    if (!fsiPin.trim()) {
      showAlert('error', 'Please enter FSI PIN');
      return;
    }
    if (fsiPin === FSI_PIN) {
      setFsiAuthenticated(true);
      showAlert('success', 'FSI authenticated successfully!');
    } else {
      showAlert('error', 'Invalid FSI PIN');
    }
  };

  // Complete Assignment
  const handleCompleteAssignment = () => {
    if (selectedTrades.length === 0) {
      showAlert('error', 'No trades selected');
      return;
    }
    const unassignedTrades = selectedTrades.filter(trade =>
      !assignedPersonnel[trade] || assignedPersonnel[trade].length === 0
    );
    if (unassignedTrades.length > 0) {
      showAlert('error', `${unassignedTrades.join(', ')} not assigned`);
      return;
    }
    setFlyingOpsSubStep(1);
    showAlert('success', 'Work assigned successfully!');
  };

  // Tradesman Sign (updated for multiple tradesmen)
  const handleTradesmanSign = (trade, pno) => {
    const pin = tradesmenPins[`${trade}-${pno}`];
    const person = (assignedPersonnel[trade] || []).find(p => p.pno === pno);
    if (!pin || !pin.trim()) {
      showAlert('error', `Please enter PIN for ${person?.name}`);
      return;
    }
    if (person && person.pin === pin) {
      setTradesmenSignatures({ ...tradesmenSignatures, [`${trade}-${pno}`]: person });
      showAlert('success', `${person.name} signed their work`);
      setTradesmenPins({ ...tradesmenPins, [`${trade}-${pno}`]: '' });
    } else {
      showAlert('error', `Invalid PIN for ${person?.name}`);
    }
  };

  // Check if all tradesmen signed
  const allTradesmenSigned = () => {
    return selectedTrades.every(trade => {
      const personnel = assignedPersonnel[trade] || [];
      return personnel.every(person => tradesmenSignatures[`${trade}-${person.pno}`]);
    });
  };

  // Move to FSI Review
  const handleMoveToReview = () => {
    if (!allTradesmenSigned()) {
      showAlert('error', 'All tradesmen must sign before proceeding');
      return;
    }
    if (selectedTrades.includes('AE') && !aeAuthenticated) {
      showAlert('error', 'AE must authenticate data');
      return;
    }
    setFlyingOpsSubStep(2);
    showAlert('success', 'Proceeding to FSI review');
  };

  // FSI Forward to Pilot
  const handleFSIForward = () => {
    if (!reviewPin.trim()) {
      showAlert('error', 'Please enter FSI PIN');
      return;
    }
    if (reviewPin === FSI_PIN) {
      setCurrentStage(1);
      setReviewPin('');
      showAlert('success', 'Forwarded to Pilot Acceptance');
    } else {
      showAlert('error', 'Invalid FSI PIN');
    }
  };

  // Pilot Accept
  const handlePilotAccept = () => {
    if (pilotPin === PILOT_PIN) {
      setCurrentStage(2);
      showAlert('success', 'Aircraft accepted!');
      setPilotPin('');
    } else {
      showAlert('error', 'Invalid Pilot PIN');
    }
  };

  // Post Flying handlers
  const handleFlightStatusSelect = (status) => {
    setFlightStatus(status);
    setDefectStatus('');
  };

  const handleDefectStatusSelect = (status) => {
    setDefectStatus(status);
  };

  const handlePilotDataAuth = () => {
    if (!flightData.landings || !flightData.airframeHours) {
      showAlert('error', 'Please fill all flight data fields');
      return;
    }
    if (postPilotPin === PILOT_PIN) {
      setPilotDataAuthenticated(true);
      showAlert('success', 'Flight data authenticated!');
      setPostPilotPin('');
    } else {
      showAlert('error', 'Invalid Pilot PIN');
    }
  };

  // AFS handlers
  const handleAFSFsiAuth = () => {
    if (afsFsiPin === FSI_PIN) {
      setAfsFsiAuthenticated(true);
      showAlert('success', 'FSI authenticated for AFS');
    } else {
      showAlert('error', 'Invalid FSI PIN');
    }
  };

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

  const handleAfsSelectSuggestion = (person) => {
    setAfsSearchPno(person.pno);
    setAfsSearchResults(person);
    setAfsSearchSuggestions([]);
  };

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
    } else {
      setAfsSearchResults(null);
      showAlert('error', 'Personnel not found');
    }
  };

  const handleAfsAssignToTrade = (trade) => {
    if (afsSearchResults && afsSearchResults.trade === trade) {
      setAfsAssignedPersonnel({ ...afsAssignedPersonnel, [trade]: afsSearchResults });
      setAfsSearchPno('');
      setAfsSearchResults(null);
    }
  };

  const handleAfsCompleteAssignment = () => {
    if (afsSelectedTrades.length === 0) {
      showAlert('error', 'No trades selected');
      return;
    }
    const unassignedTrades = afsSelectedTrades.filter(trade => !afsAssignedPersonnel[trade]);
    if (unassignedTrades.length > 0) {
      showAlert('error', `${unassignedTrades.join(', ')} not assigned`);
      return;
    }
    const supervisor = PERSONNEL_DATABASE[afsSupervisorPno.toUpperCase()];
    if (!supervisor || supervisor.trade !== 'SUP') {
      showAlert('error', 'Invalid supervisor');
      return;
    }
    setAfsStage(1);
  };

  const handleAfsTradesmanSign = (trade) => {
    const pin = afsTradesmenPins[trade];
    const person = afsAssignedPersonnel[trade];
    if (person && person.pin === pin) {
      setAfsTradesmenSignatures({ ...afsTradesmenSignatures, [trade]: person });
      setAfsTradesmenPins({ ...afsTradesmenPins, [trade]: '' });
    } else {
      showAlert('error', 'Invalid PIN');
    }
  };

  const handleAfsSupervisorSign = () => {
    const supervisor = PERSONNEL_DATABASE[afsSupervisorPno.toUpperCase()];
    const pin = afsTradesmenPins['supervisor'];
    if (supervisor && supervisor.pin === pin) {
      setAfsTradesmenSignatures({ ...afsTradesmenSignatures, supervisor });
      setAfsTradesmenPins({ ...afsTradesmenPins, supervisor: '' });
    }
  };

  const handleCompleteAfs = () => {
    const unsignedTrades = afsSelectedTrades.filter(trade => !afsTradesmenSignatures[trade]);
    if (unsignedTrades.length > 0 || !afsTradesmenSignatures.supervisor) {
      showAlert('error', 'All signatures required');
      return;
    }
    setAfsStage(2);
  };

  const handleAeAuth = () => {
    const aePerson = assignedPersonnel['AE']?.[0];
    if (!aeData.fuelQty || !aeData.tyrePressure || !aeData.oilFilled) {
      showAlert('error', 'Please fill all aircraft data fields');
      return;
    }
    if (aePerson && aePerson.pin === aeAuthPin) {
      setAeAuthenticated(true);
      showAlert('success', 'Aircraft data confirmed');
      setAeAuthPin('');
    } else {
      showAlert('error', 'Invalid AE PIN');
    }
  };

  const handleReset = () => {
    setCurrentStage(0);
    setFlyingOpsSubStep(0);
    setFsiPin('');
    setFsiAuthenticated(false);
    setSelectedTrades([]);
    setAssignedPersonnel({});
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
  };

  const mainStages = [
    { id: 0, title: 'Flying Operations', icon: <FaTools /> },
    { id: 1, title: 'Pilot Acceptance', icon: <FaUserShield /> },
    { id: 2, title: 'Post Flying', icon: <FaClipboardCheck /> }
  ];

  const flyingOpsSubSteps = [
    { id: 0, title: 'FSI Verify & Assign' },
    { id: 1, title: 'Work Completion' },
    { id: 2, title: 'FSI Review' }
  ];

  if (!selectedAircraft) {
    navigate('/aircraft-selection');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 p-4">
      {/* Alert */}
      <AnimatePresence>
        {alert.message && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 text-sm
              ${alert.type === 'success' ? 'bg-green-500 text-white' : ''}
              ${alert.type === 'error' ? 'bg-red-500 text-white' : ''}
              ${alert.type === 'info' ? 'bg-blue-500 text-white' : ''}`}
          >
            {alert.type === 'success' && <FaCheckCircle />}
            {alert.type === 'error' && <FaExclamationTriangle />}
            {alert.type === 'info' && <FaInfoCircle />}
            <span>{alert.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Progress - Horizontal */}
      <div className="flex justify-center gap-4 mb-5">
        {mainStages.map((stage, idx) => {
          const isCompleted = currentStage > stage.id;
          const isActive = currentStage === stage.id;
          return (
            <div key={stage.id} className="flex items-center">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className={`flex items-center gap-3 px-5 py-3 rounded-lg text-base font-medium transition-all
                  ${isActive ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/30' : ''}
                  ${isCompleted ? 'bg-green-500 text-white' : ''}
                  ${!isActive && !isCompleted ? 'bg-gray-200 dark:bg-slate-700 text-gray-500 dark:text-gray-400' : ''}`}
              >
                {isCompleted ? <FaCheckCircle /> : stage.icon}
                <span>{stage.title}</span>
              </motion.div>
              {idx < mainStages.length - 1 && (
                <FaChevronRight className={`mx-3 ${currentStage > idx ? 'text-green-500' : 'text-gray-300'}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Content */}
      <div className="flex gap-4 h-[calc(100vh-140px)]">
        {/* Flying Operations */}
        {currentStage === 0 && (
          <>
            {/* Vertical Sub-steps Sidebar */}
            <div className="w-52 bg-white dark:bg-slate-800 rounded-lg shadow-md p-3 flex flex-col gap-3">
              {flyingOpsSubSteps.map((step) => {
                const isCompleted = flyingOpsSubStep > step.id;
                const isActive = flyingOpsSubStep === step.id;
                const isLocked = flyingOpsSubStep < step.id;
                return (
                  <div
                    key={step.id}
                    className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all
                      ${isActive ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/30' : ''}
                      ${isCompleted ? 'bg-green-500 text-white' : ''}
                      ${isLocked ? 'bg-gray-100 dark:bg-slate-700 text-gray-400' : ''}`}
                  >
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0
                      ${isActive ? 'bg-white text-violet-600' : ''}
                      ${isCompleted ? 'bg-white text-green-500' : ''}
                      ${isLocked ? 'bg-gray-200 dark:bg-slate-600 text-gray-500' : ''}`}
                    >
                      {isCompleted ? <FaCheckCircle /> : isLocked ? <FaLock className="text-xs" /> : step.id + 1}
                    </div>
                    <span>{step.title}</span>
                  </div>
                );
              })}
            </div>

            {/* Main Content */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 bg-white dark:bg-slate-800 rounded-lg shadow-md p-5 overflow-y-auto"
            >
              {/* Sub-step 0: FSI & Assign */}
              {flyingOpsSubStep === 0 && (
                <div className="space-y-5">
                  <h2 className="text-xl font-semibold flex items-center gap-3 text-violet-600 dark:text-violet-400">
                    <FaUserShield /> FSI Verification & Work Assignment
                  </h2>

                  {!fsiAuthenticated ? (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gray-50 dark:bg-slate-700 p-5 rounded-lg max-w-lg"
                    >
                      <p className="text-base text-gray-500 dark:text-gray-400 mb-4">FSI PIN: <strong>1234</strong></p>
                      <div className="flex gap-3">
                        <input
                          type="password"
                          placeholder="Enter FSI PIN"
                          value={fsiPin}
                          onChange={(e) => setFsiPin(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleFSIAuth()}
                          className="flex-1 px-4 py-2.5 text-base rounded-lg border border-gray-300 dark:border-slate-600 dark:bg-slate-800 focus:ring-2 focus:ring-violet-500 outline-none"
                        />
                        <button
                          onClick={handleFSIAuth}
                          className="px-5 py-2.5 bg-violet-600 text-white text-base rounded-lg hover:bg-violet-700 transition flex items-center gap-2"
                        >
                          <FaCheckCircle /> Authenticate
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="space-y-5">
                      {/* Trade Selection */}
                      <div>
                        <label className="text-base font-medium text-gray-700 dark:text-gray-300 mb-3 block">
                          Select Trades Required:
                        </label>
                        <div className="grid grid-cols-4 gap-4">
                          {['AE', 'AL', 'AR', 'AO'].map(trade => (
                            <motion.div
                              key={trade}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => toggleTrade(trade)}
                              className={`p-4 rounded-lg cursor-pointer text-center transition-all
                                ${selectedTrades.includes(trade)
                                  ? 'bg-violet-100 dark:bg-violet-900/30 border-2 border-violet-500'
                                  : 'bg-gray-100 dark:bg-slate-700 border-2 border-transparent hover:border-gray-300'}`}
                            >
                              <div className="text-xl font-bold">{trade}</div>
                              {assignedPersonnel[trade]?.length > 0 && (
                                <div className="text-sm text-green-600 dark:text-green-400 mt-1 flex items-center justify-center gap-1">
                                  <FaCheckCircle /> {assignedPersonnel[trade].length} assigned
                                </div>
                              )}
                            </motion.div>
                          ))}
                        </div>
                      </div>

                      {/* Personnel Search */}
                      {selectedTrades.length > 0 && (
                        <div>
                          <label className="text-base font-medium text-gray-700 dark:text-gray-300 mb-3 block">
                            Search & Assign Personnel (Multiple per Trade):
                          </label>
                          <div className="relative max-w-xl">
                            <div className="flex gap-3">
                              <input
                                type="text"
                                placeholder="Enter PNO (e.g., AE001) or Name"
                                value={searchPno}
                                onChange={(e) => handleSearchInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearchPersonnel()}
                                className="flex-1 px-4 py-2.5 text-base rounded-lg border border-gray-300 dark:border-slate-600 dark:bg-slate-800 focus:ring-2 focus:ring-violet-500 outline-none"
                              />
                              <button
                                onClick={handleSearchPersonnel}
                                className="px-4 py-2.5 bg-gray-200 dark:bg-slate-600 text-base rounded-lg hover:bg-gray-300 dark:hover:bg-slate-500 transition"
                              >
                                <FaSearch />
                              </button>
                            </div>

                            {/* Suggestions */}
                            <AnimatePresence>
                              {searchSuggestions.length > 0 && (
                                <motion.div
                                  initial={{ opacity: 0, y: -5 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -5 }}
                                  className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-700 rounded-lg shadow-lg border border-gray-200 dark:border-slate-600 overflow-hidden"
                                >
                                  {searchSuggestions.map((person) => (
                                    <div
                                      key={person.pno}
                                      onClick={() => handleSelectSuggestion(person)}
                                      className="px-4 py-3 hover:bg-gray-100 dark:hover:bg-slate-600 cursor-pointer flex items-center gap-3 text-base"
                                    >
                                      <span className="px-2 py-1 bg-violet-100 dark:bg-violet-900 text-violet-700 dark:text-violet-300 rounded text-sm font-medium">
                                        {person.trade}
                                      </span>
                                      <span className="font-medium">{person.pno}</span>
                                      <span className="text-gray-500 dark:text-gray-400">{person.name}</span>
                                    </div>
                                  ))}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>

                          {/* Search Result */}
                          {searchResults && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="mt-4 p-4 bg-gray-50 dark:bg-slate-700 rounded-lg max-w-xl"
                            >
                              <div className="flex justify-between items-center">
                                <div className="text-base">
                                  <p className="font-medium">{searchResults.name} ({searchResults.pno})</p>
                                  <p className="text-gray-500 dark:text-gray-400">{searchResults.rank} - {searchResults.trade}</p>
                                </div>
                                {selectedTrades.includes(searchResults.trade) && (
                                  <button
                                    onClick={() => handleAssignToTrade(searchResults.trade)}
                                    className="px-4 py-2 bg-green-500 text-white text-base rounded-lg hover:bg-green-600 transition"
                                  >
                                    + Add to {searchResults.trade}
                                  </button>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </div>
                      )}

                      {/* Assigned Personnel Display */}
                      {selectedTrades.length > 0 && (
                        <div>
                          <label className="text-base font-medium text-gray-700 dark:text-gray-300 mb-3 block">
                            Assigned Personnel:
                          </label>
                          <div className="grid grid-cols-2 gap-4">
                            {selectedTrades.map(trade => (
                              <div key={trade} className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg">
                                <div className="text-base font-medium text-violet-600 dark:text-violet-400 mb-3">
                                  {trade} Trade:
                                </div>
                                {(assignedPersonnel[trade] || []).length === 0 ? (
                                  <p className="text-sm text-gray-400 italic">No personnel assigned</p>
                                ) : (
                                  <div className="space-y-2">
                                    {(assignedPersonnel[trade] || []).map(person => (
                                      <div key={person.pno} className="flex items-center justify-between bg-white dark:bg-slate-600 px-3 py-2 rounded text-base">
                                        <span>{person.name}</span>
                                        <button
                                          onClick={() => handleRemoveFromTrade(trade, person.pno)}
                                          className="text-red-500 hover:text-red-700 p-1"
                                        >
                                          <FaTimes />
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <button
                        onClick={handleCompleteAssignment}
                        className="px-6 py-3 bg-violet-600 text-white text-base font-medium rounded-lg hover:bg-violet-700 transition flex items-center gap-2"
                      >
                        Complete Assignment <FaChevronRight />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Sub-step 1: Tradesmen Work */}
              {flyingOpsSubStep === 1 && (
                <div className="space-y-5">
                  <h2 className="text-xl font-semibold flex items-center gap-3 text-violet-600 dark:text-violet-400">
                    <FaUsers /> Tradesmen Work Completion
                  </h2>

                  {/* AE Data Entry */}
                  {selectedTrades.includes('AE') && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-5 rounded-lg"
                    >
                      <h3 className="text-base font-medium text-amber-700 dark:text-amber-400 mb-4">AE Data Entry</h3>
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div>
                          <label className="text-sm text-gray-600 dark:text-gray-400 block mb-2">Fuel Quantity (L)</label>
                          <input
                            type="number"
                            value={aeData.fuelQty}
                            onChange={(e) => setAeData({ ...aeData, fuelQty: e.target.value })}
                            disabled={aeAuthenticated}
                            className="w-full px-4 py-2.5 text-base rounded-lg border border-gray-300 dark:border-slate-600 dark:bg-slate-800 disabled:bg-gray-100 dark:disabled:bg-slate-700"
                          />
                        </div>
                        <div>
                          <label className="text-sm text-gray-600 dark:text-gray-400 block mb-2">Tyre Pressure (PSI)</label>
                          <input
                            type="number"
                            value={aeData.tyrePressure}
                            onChange={(e) => setAeData({ ...aeData, tyrePressure: e.target.value })}
                            disabled={aeAuthenticated}
                            className="w-full px-4 py-2.5 text-base rounded-lg border border-gray-300 dark:border-slate-600 dark:bg-slate-800 disabled:bg-gray-100 dark:disabled:bg-slate-700"
                          />
                        </div>
                        <div>
                          <label className="text-sm text-gray-600 dark:text-gray-400 block mb-2">Oil Filled (L)</label>
                          <input
                            type="number"
                            value={aeData.oilFilled}
                            onChange={(e) => setAeData({ ...aeData, oilFilled: e.target.value })}
                            disabled={aeAuthenticated}
                            className="w-full px-4 py-2.5 text-base rounded-lg border border-gray-300 dark:border-slate-600 dark:bg-slate-800 disabled:bg-gray-100 dark:disabled:bg-slate-700"
                          />
                        </div>
                      </div>
                      {!aeAuthenticated ? (
                        <div className="flex gap-3 items-center">
                          <input
                            type="password"
                            placeholder={`AE PIN (${assignedPersonnel['AE']?.[0]?.pin})`}
                            value={aeAuthPin}
                            onChange={(e) => setAeAuthPin(e.target.value)}
                            className="flex-1 px-4 py-2.5 text-base rounded-lg border border-amber-300 dark:border-amber-700 dark:bg-slate-800"
                          />
                          <button onClick={handleAeAuth} className="px-5 py-2.5 bg-amber-500 text-white text-base rounded-lg hover:bg-amber-600">
                            Confirm Data
                          </button>
                        </div>
                      ) : (
                        <p className="text-base text-green-600 dark:text-green-400 flex items-center gap-2">
                          <FaCheckCircle /> Data confirmed by {assignedPersonnel['AE']?.[0]?.name}
                        </p>
                      )}
                    </motion.div>
                  )}

                  {/* Signatures Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    {selectedTrades.map(trade => (
                      (assignedPersonnel[trade] || []).map(person => {
                        const signed = tradesmenSignatures[`${trade}-${person.pno}`];
                        return (
                          <motion.div
                            key={`${trade}-${person.pno}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className={`p-4 rounded-lg border ${signed ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'bg-gray-50 dark:bg-slate-700 border-gray-200 dark:border-slate-600'}`}
                          >
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <p className="text-base font-medium">{trade} - {person.name}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{person.rank}</p>
                              </div>
                              {signed && <FaCheckCircle className="text-green-500 text-lg" />}
                            </div>
                            {!signed && (
                              <div className="flex gap-3">
                                <input
                                  type="password"
                                  placeholder={`PIN (${person.pin})`}
                                  value={tradesmenPins[`${trade}-${person.pno}`] || ''}
                                  onChange={(e) => setTradesmenPins({ ...tradesmenPins, [`${trade}-${person.pno}`]: e.target.value })}
                                  className="flex-1 px-3 py-2 text-base rounded border border-gray-300 dark:border-slate-600 dark:bg-slate-800"
                                />
                                <button
                                  onClick={() => handleTradesmanSign(trade, person.pno)}
                                  className="px-4 py-2 bg-violet-600 text-white text-base rounded hover:bg-violet-700"
                                >
                                  Sign
                                </button>
                              </div>
                            )}
                          </motion.div>
                        );
                      })
                    ))}
                  </div>

                  <button
                    onClick={handleMoveToReview}
                    className="px-6 py-3 bg-violet-600 text-white text-base font-medium rounded-lg hover:bg-violet-700 transition flex items-center gap-2"
                  >
                    Proceed to Review <FaChevronRight />
                  </button>
                </div>
              )}

              {/* Sub-step 2: FSI Review */}
              {flyingOpsSubStep === 2 && (
                <div className="space-y-5">
                  <h2 className="text-xl font-semibold flex items-center gap-3 text-violet-600 dark:text-violet-400">
                    <FaCheckCircle /> FSI Review & Forward
                  </h2>

                  <div className="bg-gray-50 dark:bg-slate-700 p-5 rounded-lg">
                    <h3 className="text-base font-medium mb-4">Work Summary</h3>
                    <div className="grid grid-cols-2 gap-3 text-base">
                      {selectedTrades.map(trade => (
                        (assignedPersonnel[trade] || []).map(person => (
                          <div key={`${trade}-${person.pno}`} className="flex items-center gap-2">
                            <FaCheckCircle className="text-green-500" />
                            <strong>{trade}:</strong> {person.name}
                          </div>
                        ))
                      ))}
                    </div>

                    {selectedTrades.includes('AE') && (
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-600 text-base">
                        <strong>AE Data:</strong> Fuel: {aeData.fuelQty}L | Tyre: {aeData.tyrePressure} PSI | Oil: {aeData.oilFilled}L
                      </div>
                    )}
                  </div>

                  <div className="max-w-lg">
                    <p className="text-base text-gray-500 dark:text-gray-400 mb-3">FSI PIN: <strong>1234</strong></p>
                    <div className="flex gap-3">
                      <input
                        type="password"
                        placeholder="Enter FSI PIN to forward"
                        value={reviewPin}
                        onChange={(e) => setReviewPin(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleFSIForward()}
                        className="flex-1 px-4 py-2.5 text-base rounded-lg border border-gray-300 dark:border-slate-600 dark:bg-slate-800 focus:ring-2 focus:ring-green-500 outline-none"
                      />
                      <button
                        onClick={handleFSIForward}
                        className="px-5 py-2.5 bg-green-500 text-white text-base rounded-lg hover:bg-green-600 transition flex items-center gap-2"
                      >
                        Forward to Pilot <FaChevronRight />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}

        {/* Pilot Acceptance */}
        {currentStage === 1 && (
          <PilotAcceptance
            selectedTrades={selectedTrades}
            assignedPersonnel={assignedPersonnel}
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
