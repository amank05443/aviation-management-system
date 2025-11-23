import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaArrowLeft, FaCheckCircle, FaPlus, FaTimes, FaUserShield,
  FaExclamationTriangle, FaInfoCircle, FaSearch, FaTools
} from 'react-icons/fa';

const MAINTENANCE_TYPES = [
  '100 Hourly',
  '200 Hourly',
  'Weekly',
  '3 Monthly',
  '6 Monthly',
  '12 Monthly',
];

const SECTIONS = ['AE', 'AL', 'AR', 'AO'];

// Pre-filled job templates per maintenance type (hardcoded for now, will be from DB later)
const JOB_TEMPLATES = {
  '100 Hourly': {
    AE: [
      { id: 1, description: 'Inspect engine oil level and check for visible leaks', manHours: '1.0' },
      { id: 2, description: 'Check airframe structure for cracks and corrosion', manHours: '1.5' },
      { id: 3, description: 'Verify control surface operation and hinges', manHours: '1.0' },
    ],
    AL: [
      { id: 1, description: 'Check battery condition, voltage and terminals', manHours: '0.5' },
      { id: 2, description: 'Inspect wiring looms and electrical connectors', manHours: '1.0' },
      { id: 3, description: 'Test exterior and cockpit lighting system', manHours: '0.75' },
    ],
    AR: [
      { id: 1, description: 'Verify communication radios operation (TX/RX)', manHours: '0.75' },
      { id: 2, description: 'Test navigation equipment functionality', manHours: '1.0' },
      { id: 3, description: 'Check antenna mounts, security and cabling', manHours: '0.5' },
    ],
    AO: [
      { id: 1, description: 'Inspect weapon mounting points for damage/wear', manHours: '1.0' },
      { id: 2, description: 'Check safety pins, safety devices and their proper installation', manHours: '0.75' },
      { id: 3, description: 'Verify arming system indications and interlocks', manHours: '0.75' },
    ],
  },
  '200 Hourly': {
    AE: [
      { id: 1, description: 'Complete engine overhaul inspection', manHours: '3.0' },
      { id: 2, description: 'Landing gear detailed inspection', manHours: '2.5' },
    ],
    AL: [
      { id: 1, description: 'Electrical system comprehensive check', manHours: '2.0' },
      { id: 2, description: 'Generator and alternator testing', manHours: '1.5' },
    ],
    AR: [
      { id: 1, description: 'Complete avionics system test', manHours: '2.0' },
    ],
    AO: [
      { id: 1, description: 'Weapons system comprehensive inspection', manHours: '2.5' },
    ],
  },
  'Weekly': {
    AE: [
      { id: 1, description: 'Visual inspection of aircraft exterior', manHours: '0.5' },
      { id: 2, description: 'Check fluid levels', manHours: '0.25' },
    ],
    AL: [
      { id: 1, description: 'Battery check', manHours: '0.25' },
    ],
    AR: [
      { id: 1, description: 'Radio functionality test', manHours: '0.5' },
    ],
    AO: [
      { id: 1, description: 'Safety device inspection', manHours: '0.5' },
    ],
  },
  '3 Monthly': {
    AE: [
      { id: 1, description: 'Quarterly airframe inspection', manHours: '2.0' },
    ],
    AL: [
      { id: 1, description: 'Quarterly electrical system check', manHours: '1.5' },
    ],
    AR: [
      { id: 1, description: 'Quarterly avionics inspection', manHours: '1.5' },
    ],
    AO: [
      { id: 1, description: 'Quarterly weapons system check', manHours: '1.5' },
    ],
  },
  '6 Monthly': {
    AE: [
      { id: 1, description: 'Semi-annual comprehensive inspection', manHours: '4.0' },
    ],
    AL: [
      { id: 1, description: 'Semi-annual electrical overhaul', manHours: '3.0' },
    ],
    AR: [
      { id: 1, description: 'Semi-annual avionics calibration', manHours: '3.0' },
    ],
    AO: [
      { id: 1, description: 'Semi-annual weapons system overhaul', manHours: '3.0' },
    ],
  },
  '12 Monthly': {
    AE: [
      { id: 1, description: 'Annual airframe comprehensive inspection', manHours: '6.0' },
    ],
    AL: [
      { id: 1, description: 'Annual electrical system overhaul', manHours: '5.0' },
    ],
    AR: [
      { id: 1, description: 'Annual avionics complete check', manHours: '5.0' },
    ],
    AO: [
      { id: 1, description: 'Annual weapons system certification', manHours: '5.0' },
    ],
  },
};

// Personnel Database
const PERSONNEL_DATABASE = {
  'AE001': { pno: 'AE001', name: 'Rajesh Kumar', rank: 'Sergeant', trade: 'AE', pin: '1111' },
  'AE002': { pno: 'AE002', name: 'Amit Singh', rank: 'Corporal', trade: 'AE', pin: '1112' },
  'AE003': { pno: 'AE003', name: 'Pradeep Sharma', rank: 'LAC', trade: 'AE', pin: '1113' },
  'AL001': { pno: 'AL001', name: 'Suresh Verma', rank: 'Corporal', trade: 'AL', pin: '2222' },
  'AL002': { pno: 'AL002', name: 'Vikram Rao', rank: 'LAC', trade: 'AL', pin: '2223' },
  'AL003': { pno: 'AL003', name: 'Naveen Singh', rank: 'Corporal', trade: 'AL', pin: '2224' },
  'AR001': { pno: 'AR001', name: 'Manoj Sharma', rank: 'Corporal', trade: 'AR', pin: '3333' },
  'AR002': { pno: 'AR002', name: 'Deepak Joshi', rank: 'LAC', trade: 'AR', pin: '3334' },
  'AR003': { pno: 'AR003', name: 'Arun Reddy', rank: 'Corporal', trade: 'AR', pin: '3335' },
  'AO001': { pno: 'AO001', name: 'Rahul Gupta', rank: 'Corporal', trade: 'AO', pin: '4444' },
  'AO002': { pno: 'AO002', name: 'Ajay Patel', rank: 'LAC', trade: 'AO', pin: '4445' },
  'AO003': { pno: 'AO003', name: 'Dinesh Nair', rank: 'Corporal', trade: 'AO', pin: '4446' },
  'SUP001': { pno: 'SUP001', name: 'Vijay Reddy', rank: 'JWO', trade: 'SUP', pin: '9999' },
  'SUP002': { pno: 'SUP002', name: 'Anil Kumar', rank: 'Sergeant', trade: 'SUP', pin: '9998' },
  'SUP003': { pno: 'SUP003', name: 'Prakash Jain', rank: 'JWO', trade: 'SUP', pin: '9997' },
};

const ATO_PIN = '1234';

const ScheduleMaintenance = () => {
  const navigate = useNavigate();
  const { selectedAircraft } = useAuth();

  const [maintenanceType, setMaintenanceType] = useState('');
  const [usePrefilledJobs, setUsePrefilledJobs] = useState(true);
  const [activeSection, setActiveSection] = useState('AE');

  // Jobs structure: { AE: [{ id, description, manHours, remarks, tradesmen: [], supervisors: [] }] }
  const [jobs, setJobs] = useState({ AE: [], AL: [], AR: [], AO: [] });

  // For adding new jobs
  const [newJobForms, setNewJobForms] = useState({
    AE: { description: '', manHours: '' },
    AL: { description: '', manHours: '' },
    AR: { description: '', manHours: '' },
    AO: { description: '', manHours: '' },
  });

  // Personnel search for signatures
  const [searchPno, setSearchPno] = useState({});
  const [searchResults, setSearchResults] = useState({});
  const [searchSuggestions, setSearchSuggestions] = useState({});

  // Signature PINs
  const [tradesmanPins, setTradesmanPins] = useState({});
  const [supervisorPins, setSupervisorPins] = useState({});

  // ATO Final Signature
  const [atoSignature, setAtoSignature] = useState('');
  const [atoPin, setAtoPin] = useState('');
  const [atoSigned, setAtoSigned] = useState(false);

  // Alerts
  const [alert, setAlert] = useState({ type: '', message: '' });
  const [saving, setSaving] = useState(false);

  const showAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert({ type: '', message: '' }), 3000);
  };

  // Initialize jobs when maintenance type is selected
  useEffect(() => {
    if (maintenanceType && usePrefilledJobs) {
      const templates = JOB_TEMPLATES[maintenanceType] || {};
      const initialJobs = {};

      SECTIONS.forEach(section => {
        const sectionTemplates = templates[section] || [];
        initialJobs[section] = sectionTemplates.map(template => ({
          ...template,
          id: `${section}-${template.id}-${Date.now()}`,
          remarks: '',
          tradesmen: [],
          supervisors: [],
        }));
      });

      setJobs(initialJobs);
    } else if (maintenanceType && !usePrefilledJobs) {
      // Empty job card
      setJobs({ AE: [], AL: [], AR: [], AO: [] });
    }
  }, [maintenanceType, usePrefilledJobs]);

  const handleMaintenanceTypeChange = (value) => {
    setMaintenanceType(value);
    setActiveSection('AE');
  };

  // Add new job to section
  const handleAddNewJob = (section) => {
    const form = newJobForms[section];
    if (!form.description.trim() || !form.manHours) {
      showAlert('error', 'Please fill in job description and man hours');
      return;
    }

    const newJob = {
      id: `${section}-custom-${Date.now()}`,
      description: form.description,
      manHours: form.manHours,
      remarks: '',
      tradesmen: [],
      supervisors: [],
    };

    setJobs({
      ...jobs,
      [section]: [...jobs[section], newJob],
    });

    setNewJobForms({
      ...newJobForms,
      [section]: { description: '', manHours: '' },
    });

    showAlert('success', `Job added to ${section}`);
  };

  // Remove job
  const handleRemoveJob = (section, jobId) => {
    setJobs({
      ...jobs,
      [section]: jobs[section].filter(job => job.id !== jobId),
    });
    showAlert('info', 'Job removed');
  };

  // Update job field
  const handleJobFieldChange = (section, jobId, field, value) => {
    setJobs({
      ...jobs,
      [section]: jobs[section].map(job =>
        job.id === jobId ? { ...job, [field]: value } : job
      ),
    });
  };

  // Personnel search
  const handleSearchInput = (key, value) => {
    setSearchPno({ ...searchPno, [key]: value });

    if (value.trim().length < 2) {
      setSearchSuggestions({ ...searchSuggestions, [key]: [] });
      return;
    }

    const searchTerm = value.toLowerCase();
    const matches = Object.values(PERSONNEL_DATABASE).filter(p =>
      p.pno.toLowerCase().includes(searchTerm) ||
      p.name.toLowerCase().includes(searchTerm)
    ).slice(0, 5);

    setSearchSuggestions({ ...searchSuggestions, [key]: matches });
  };

  const handleSelectSuggestion = (key, person) => {
    setSearchPno({ ...searchPno, [key]: person.pno });
    setSearchResults({ ...searchResults, [key]: person });
    setSearchSuggestions({ ...searchSuggestions, [key]: [] });
  };

  const handleSearchPersonnel = (key) => {
    const pno = searchPno[key];
    const searchTerm = pno?.toLowerCase() || '';
    let person = PERSONNEL_DATABASE[pno?.toUpperCase()];

    if (!person) {
      person = Object.values(PERSONNEL_DATABASE).find(p =>
        p.name.toLowerCase().includes(searchTerm)
      );
    }

    if (person) {
      setSearchResults({ ...searchResults, [key]: person });
      setSearchSuggestions({ ...searchSuggestions, [key]: [] });
      showAlert('success', `Found: ${person.name}`);
    } else {
      setSearchResults({ ...searchResults, [key]: null });
      showAlert('error', 'Personnel not found');
    }
  };

  // Add tradesman signature
  const handleAddTradesmanSignature = (section, jobId) => {
    const key = `tradesman-${section}-${jobId}`;
    const pin = tradesmanPins[key];
    const person = searchResults[key];

    if (!person) {
      showAlert('error', 'Please search and select personnel first');
      return;
    }

    if (person.trade !== section) {
      showAlert('error', `This personnel is not ${section} trade`);
      return;
    }

    if (!pin || !pin.trim()) {
      showAlert('error', 'Please enter PIN');
      return;
    }

    if (person.pin !== pin) {
      showAlert('error', 'Invalid PIN');
      return;
    }

    // Check if already signed
    const job = jobs[section].find(j => j.id === jobId);
    if (job.tradesmen.some(t => t.pno === person.pno)) {
      showAlert('error', 'This tradesman has already signed');
      return;
    }

    // Add signature
    setJobs({
      ...jobs,
      [section]: jobs[section].map(job =>
        job.id === jobId
          ? { ...job, tradesmen: [...job.tradesmen, person] }
          : job
      ),
    });

    // Clear fields
    setTradesmanPins({ ...tradesmanPins, [key]: '' });
    setSearchPno({ ...searchPno, [key]: '' });
    setSearchResults({ ...searchResults, [key]: null });

    showAlert('success', `${person.name} signed as tradesman`);
  };

  // Add supervisor signature
  const handleAddSupervisorSignature = (section, jobId) => {
    const key = `supervisor-${section}-${jobId}`;
    const pin = supervisorPins[key];
    const person = searchResults[key];

    if (!person) {
      showAlert('error', 'Please search and select personnel first');
      return;
    }

    if (person.trade !== 'SUP') {
      showAlert('error', 'This personnel is not a supervisor');
      return;
    }

    if (!pin || !pin.trim()) {
      showAlert('error', 'Please enter supervisor PIN');
      return;
    }

    if (person.pin !== pin) {
      showAlert('error', 'Invalid PIN');
      return;
    }

    // Check if already signed
    const job = jobs[section].find(j => j.id === jobId);
    if (job.supervisors.some(s => s.pno === person.pno)) {
      showAlert('error', 'This supervisor has already signed');
      return;
    }

    // Check if at least one tradesman has signed
    if (job.tradesmen.length === 0) {
      showAlert('error', 'At least one tradesman must sign before supervisor');
      return;
    }

    // Add signature
    setJobs({
      ...jobs,
      [section]: jobs[section].map(job =>
        job.id === jobId
          ? { ...job, supervisors: [...job.supervisors, person] }
          : job
      ),
    });

    // Clear fields
    setSupervisorPins({ ...supervisorPins, [key]: '' });
    setSearchPno({ ...searchPno, [key]: '' });
    setSearchResults({ ...searchResults, [key]: null });

    showAlert('success', `${person.name} signed as supervisor`);
  };

  // Remove signature
  const handleRemoveSignature = (section, jobId, type, pno) => {
    setJobs({
      ...jobs,
      [section]: jobs[section].map(job =>
        job.id === jobId
          ? {
              ...job,
              [type]: job[type].filter(person => person.pno !== pno),
            }
          : job
      ),
    });
    showAlert('info', 'Signature removed');
  };

  // Check if all jobs are signed
  const allJobsSigned = useMemo(() => {
    for (const section of SECTIONS) {
      for (const job of jobs[section]) {
        if (job.tradesmen.length === 0 || job.supervisors.length === 0) {
          return false;
        }
      }
    }
    return true;
  }, [jobs]);

  // ATO Final Sign
  const handleAtoSign = () => {
    if (!atoSignature.trim()) {
      showAlert('error', 'Please enter ATO signature');
      return;
    }
    if (!atoPin.trim()) {
      showAlert('error', 'Please enter ATO PIN');
      return;
    }
    if (!allJobsSigned) {
      showAlert('error', 'All jobs must be signed by tradesmen and supervisors');
      return;
    }
    if (atoPin === ATO_PIN) {
      setAtoSigned(true);
      showAlert('success', 'ATO signed successfully!');
    } else {
      showAlert('error', 'Invalid ATO PIN');
    }
  };

  // Submit
  const handleSubmit = async () => {
    if (!atoSigned) {
      showAlert('error', 'ATO must sign to complete the job card');
      return;
    }

    const payload = {
      aircraft_id: selectedAircraft?.id,
      maintenance_type: maintenanceType,
      sections: SECTIONS.map(section => ({
        name: section,
        jobs: jobs[section].map(job => ({
          description: job.description,
          man_hours: job.manHours,
          remarks: job.remarks,
          tradesmen: job.tradesmen.map(t => ({ pno: t.pno, name: t.name })),
          supervisors: job.supervisors.map(s => ({ pno: s.pno, name: s.name })),
        })),
      })),
      ato_signature: atoSignature,
    };

    try {
      setSaving(true);
      await axios.post('/api/maintenance-schedules/', payload);
      showAlert('success', 'Maintenance job card created successfully!');
      setTimeout(() => navigate('/maintenance'), 2000);
    } catch (error) {
      console.error('Failed to save maintenance:', error);
      showAlert('error', 'Failed to save maintenance record.');
    } finally {
      setSaving(false);
    }
  };

  const totalJobs = useMemo(() => {
    return Object.values(jobs).reduce((sum, sectionJobs) => sum + sectionJobs.length, 0);
  }, [jobs]);

  const totalManHours = useMemo(() => {
    return Object.values(jobs).reduce((sum, sectionJobs) => {
      const sectionTotal = sectionJobs.reduce((sectionSum, job) => {
        // Only count hours if supervisors have signed
        if (job.supervisors && job.supervisors.length > 0) {
          const hours = parseFloat(job.manHours) || 0;
          return sectionSum + hours;
        }
        return sectionSum;
      }, 0);
      return sum + sectionTotal;
    }, 0);
  }, [jobs]);

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

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/maintenance')}
            className="inline-flex items-center gap-2 rounded-lg border border-violet-600 bg-violet-600 px-3 py-2 text-sm text-white shadow-sm hover:bg-violet-700 transition"
          >
            <FaArrowLeft className="h-3 w-3" />
            Back
          </button>
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              Schedule Maintenance
            </h1>
            {selectedAircraft && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {selectedAircraft.registration} {selectedAircraft.name}
              </p>
            )}
          </div>
        </div>

        <button
          onClick={() => {
            setUsePrefilledJobs(false);
            setMaintenanceType('Custom');
            setJobs({ AE: [], AL: [], AR: [], AO: [] });
            showAlert('info', 'Creating new blank job card');
          }}
          className="px-4 py-2 bg-violet-600 text-white text-sm rounded-lg hover:bg-violet-700 transition flex items-center gap-2"
        >
          <FaPlus /> Add New Job Card
        </button>
      </div>

      {/* Maintenance Type Selection */}
      <div className="bg-gradient-to-r from-violet-50 to-purple-50 dark:from-slate-800 dark:to-slate-700 rounded-2xl shadow-lg border-2 border-violet-200 dark:border-violet-800 p-6 mb-5">
        <div className="flex items-center gap-4">
          <div className="flex-1 max-w-lg">
            <label className="text-base font-semibold text-violet-900 dark:text-violet-200 mb-3 flex items-center gap-2">
              <FaTools className="text-violet-600 dark:text-violet-400" />
              Type of Maintenance
            </label>
            <select
              value={maintenanceType}
              onChange={(e) => handleMaintenanceTypeChange(e.target.value)}
              className="w-full rounded-xl border-2 border-violet-300 dark:border-violet-600 bg-white dark:bg-slate-700 px-4 py-3 text-base font-medium text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none shadow-sm hover:border-violet-400 transition-all"
            >
              <option value="">Select maintenance type...</option>
              {MAINTENANCE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {maintenanceType && (
            <div className="flex flex-col gap-2">
              <div className="bg-white dark:bg-slate-800 rounded-xl px-5 py-3 border-2 border-violet-300 dark:border-violet-700 shadow-md">
                <div className="text-xs font-semibold text-violet-600 dark:text-violet-400 mb-1">Total Jobs</div>
                <div className="text-3xl font-bold text-violet-700 dark:text-violet-300">{totalJobs}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      {maintenanceType && (
        <div className="space-y-5">
          {/* Tabs */}
          <div className="flex gap-3">
            {SECTIONS.map((section) => (
              <button
                key={section}
                onClick={() => setActiveSection(section)}
                className={`px-5 py-2.5 rounded-lg text-base font-medium transition-all
                  ${activeSection === section
                    ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/30'
                    : 'bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-slate-600'}`}
              >
                {section} ({jobs[section].length})
              </button>
            ))}
          </div>

          {/* Jobs Table */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {activeSection} Jobs
              </h2>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {maintenanceType} Inspection
              </span>
            </div>

            {jobs[activeSection].length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8 italic">
                No jobs for this section yet. Add jobs below.
              </p>
            ) : (
              <div className="space-y-4">
                {jobs[activeSection].map((job, idx) => (
                  <JobRow
                    key={job.id}
                    job={job}
                    index={idx}
                    section={activeSection}
                    onFieldChange={handleJobFieldChange}
                    onRemove={handleRemoveJob}
                    searchPno={searchPno}
                    searchResults={searchResults}
                    searchSuggestions={searchSuggestions}
                    onSearchInput={handleSearchInput}
                    onSelectSuggestion={handleSelectSuggestion}
                    onSearchPersonnel={handleSearchPersonnel}
                    tradesmanPins={tradesmanPins}
                    supervisorPins={supervisorPins}
                    setTradesmanPins={setTradesmanPins}
                    setSupervisorPins={setSupervisorPins}
                    onAddTradesmanSignature={handleAddTradesmanSignature}
                    onAddSupervisorSignature={handleAddSupervisorSignature}
                    onRemoveSignature={handleRemoveSignature}
                  />
                ))}
              </div>
            )}

            {/* Add New Job */}
            <div className="mt-5 pt-5 border-t border-gray-200 dark:border-slate-700">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Add Custom Job</p>
              <div className="grid grid-cols-12 gap-3">
                <div className="col-span-7">
                  <input
                    type="text"
                    placeholder="Job description"
                    value={newJobForms[activeSection].description}
                    onChange={(e) => setNewJobForms({
                      ...newJobForms,
                      [activeSection]: { ...newJobForms[activeSection], description: e.target.value }
                    })}
                    className="w-full rounded-lg border border-gray-300 dark:border-slate-600 dark:bg-slate-700 px-3 py-2 text-sm focus:ring-2 focus:ring-violet-500 outline-none"
                  />
                </div>
                <div className="col-span-3">
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Man Hours"
                    value={newJobForms[activeSection].manHours}
                    onChange={(e) => setNewJobForms({
                      ...newJobForms,
                      [activeSection]: { ...newJobForms[activeSection], manHours: e.target.value }
                    })}
                    className="w-full rounded-lg border border-gray-300 dark:border-slate-600 dark:bg-slate-700 px-3 py-2 text-sm focus:ring-2 focus:ring-violet-500 outline-none"
                  />
                </div>
                <div className="col-span-2">
                  <button
                    onClick={() => handleAddNewJob(activeSection)}
                    className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition flex items-center justify-center gap-2 text-sm"
                  >
                    <FaPlus /> Add Job
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ATO Final Approval */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-5">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <FaUserShield /> ATO Final Approval
            </h2>

            {/* Total Man Hours Display */}
            <div className="bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-violet-900 dark:text-violet-300">Total Man Hours (All Sections):</span>
                <span className="text-2xl font-bold text-violet-600 dark:text-violet-400">{totalManHours.toFixed(1)}</span>
              </div>
            </div>

            {!allJobsSigned && (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-4 text-sm text-amber-700 dark:text-amber-400">
                <FaExclamationTriangle className="inline mr-2" />
                All jobs in all sections must be signed by tradesmen and supervisors before ATO can approve.
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 max-w-2xl">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  ATO Signature
                </label>
                <input
                  type="text"
                  placeholder="ATO name / digital signature"
                  value={atoSignature}
                  onChange={(e) => setAtoSignature(e.target.value)}
                  disabled={atoSigned}
                  className={`w-full rounded-lg border px-3 py-2.5 ${
                    atoSigned
                      ? 'border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700'
                      : 'border-gray-300 dark:border-slate-600 dark:bg-slate-700 focus:ring-2 focus:ring-violet-500'
                  } outline-none`}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  ATO PIN
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">PIN: <strong>1234</strong></p>
                <div className="flex gap-2">
                  <input
                    type="password"
                    placeholder="Enter ATO PIN"
                    value={atoPin}
                    onChange={(e) => setAtoPin(e.target.value)}
                    disabled={atoSigned}
                    className={`flex-1 rounded-lg border px-3 py-2 ${
                      atoSigned
                        ? 'border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700'
                        : 'border-gray-300 dark:border-slate-600 dark:bg-slate-700 focus:ring-2 focus:ring-violet-500'
                    } outline-none`}
                  />
                  {!atoSigned && (
                    <button
                      onClick={handleAtoSign}
                      disabled={!allJobsSigned}
                      className={`px-4 py-2 rounded-lg transition flex items-center gap-2 text-sm ${
                        !allJobsSigned
                          ? 'bg-gray-300 dark:bg-slate-600 text-gray-600 dark:text-gray-400 cursor-not-allowed'
                          : 'bg-green-500 text-white hover:bg-green-600'
                      }`}
                    >
                      <FaCheckCircle /> Sign
                    </button>
                  )}
                </div>
              </div>
            </div>

            {atoSigned && (
              <div className="mt-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-center gap-3 text-green-700 dark:text-green-400">
                <FaCheckCircle className="text-xl" />
                <div>
                  <p className="font-semibold">ATO Signed Successfully!</p>
                  <p className="text-sm">Job card is ready for submission</p>
                </div>
              </div>
            )}

            <div className="mt-5">
              <button
                onClick={handleSubmit}
                disabled={!atoSigned || saving}
                className={`px-6 py-3 rounded-lg font-medium transition ${
                  !atoSigned || saving
                    ? 'bg-gray-300 dark:bg-slate-600 text-gray-600 dark:text-gray-400 cursor-not-allowed'
                    : 'bg-violet-600 text-white hover:bg-violet-700 shadow-md'
                }`}
              >
                {saving ? 'Saving...' : 'Submit Job Card'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Job Row Component
const JobRow = ({
  job,
  index,
  section,
  onFieldChange,
  onRemove,
  searchPno,
  searchResults,
  searchSuggestions,
  onSearchInput,
  onSelectSuggestion,
  onSearchPersonnel,
  tradesmanPins,
  supervisorPins,
  setTradesmanPins,
  setSupervisorPins,
  onAddTradesmanSignature,
  onAddSupervisorSignature,
  onRemoveSignature,
}) => {
  const tradesmanKey = `tradesman-${section}-${job.id}`;
  const supervisorKey = `supervisor-${section}-${job.id}`;

  return (
    <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-3 border border-gray-200 dark:border-slate-600 mb-2">
      {/* Row 1: Job Details */}
      <div className="flex items-center gap-3 mb-3">
        {/* Job Number */}
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-violet-100 dark:bg-violet-900 text-violet-600 dark:text-violet-300 flex items-center justify-center font-bold text-sm">
            {index + 1}
          </div>
        </div>

        {/* Description */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-white truncate" title={job.description}>
            {job.description}
          </p>
        </div>

        {/* Man Hours */}
        <div className="flex-shrink-0 w-28">
          <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">Man Hours</label>
          <input
            type="text"
            value={job.manHours}
            onChange={(e) => onFieldChange(section, job.id, 'manHours', e.target.value)}
            className="w-full px-3 py-2 text-sm rounded border border-gray-300 dark:border-slate-600 dark:bg-slate-800 focus:ring-1 focus:ring-violet-500 outline-none"
            placeholder="Hours"
          />
        </div>

        {/* Remarks */}
        <div className="flex-shrink-0 w-48">
          <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">Remarks</label>
          <input
            type="text"
            placeholder="Enter remarks"
            value={job.remarks}
            onChange={(e) => onFieldChange(section, job.id, 'remarks', e.target.value)}
            className="w-full px-3 py-2 text-sm rounded border border-gray-300 dark:border-slate-600 dark:bg-slate-800 focus:ring-1 focus:ring-violet-500 outline-none"
          />
        </div>
      </div>

      {/* Row 2: Signatures */}
      <div className="flex items-center gap-4 border-t border-gray-300 dark:border-slate-600 pt-3">
        {/* Tradesmen Signatures */}
        <div className="flex-1 flex items-center gap-2">
          <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex-shrink-0">
            Tradesmen ({section}):
          </label>

          {job.tradesmen.length > 0 && (
            <div className="flex gap-1 flex-wrap">
              {job.tradesmen.map((tradesman) => (
                <div
                  key={tradesman.pno}
                  className="inline-flex items-center gap-1 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded px-2 py-1 text-sm whitespace-nowrap"
                  title={`${tradesman.name} (${tradesman.pno})`}
                >
                  <FaCheckCircle className="text-green-600 dark:text-green-400 text-sm" />
                  <span className="text-green-700 dark:text-green-300">{tradesman.pno}</span>
                  <button
                    onClick={() => onRemoveSignature(section, job.id, 'tradesmen', tradesman.pno)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FaTimes className="text-sm" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center gap-1 relative flex-shrink-0">
            <input
              type="text"
              placeholder="PNO/Name"
              value={searchPno[tradesmanKey] || ''}
              onChange={(e) => onSearchInput(tradesmanKey, e.target.value)}
              className="w-28 px-3 py-2 text-sm rounded border border-gray-300 dark:border-slate-600 dark:bg-slate-800 focus:ring-1 focus:ring-violet-500 outline-none"
            />

            {/* Suggestions */}
            <AnimatePresence>
              {searchSuggestions[tradesmanKey]?.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="absolute z-20 top-full left-0 w-56 mt-1 bg-white dark:bg-slate-700 rounded-lg shadow-lg border border-gray-200 dark:border-slate-600 overflow-hidden"
                >
                  {searchSuggestions[tradesmanKey].map((person) => (
                    <div
                      key={person.pno}
                      onClick={() => onSelectSuggestion(tradesmanKey, person)}
                      className="px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-slate-600 cursor-pointer flex items-center gap-2 text-xs"
                    >
                      <span className="px-1.5 py-0.5 bg-violet-100 dark:bg-violet-900 text-violet-700 dark:text-violet-300 rounded text-xs font-medium">
                        {person.trade}
                      </span>
                      <span className="font-medium">{person.pno}</span>
                      <span className="text-gray-500 dark:text-gray-400 truncate">{person.name}</span>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            <input
              type="password"
              placeholder="PIN"
              value={tradesmanPins[tradesmanKey] || ''}
              onChange={(e) => setTradesmanPins({ ...tradesmanPins, [tradesmanKey]: e.target.value })}
              className="w-20 px-3 py-2 text-sm rounded border border-gray-300 dark:border-slate-600 dark:bg-slate-800 focus:ring-1 focus:ring-violet-500 outline-none"
            />
            <button
              onClick={() => onAddTradesmanSignature(section, job.id)}
              className="px-3 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition whitespace-nowrap"
            >
              Sign
            </button>
          </div>
        </div>

        {/* Supervisor Signatures */}
        <div className="flex-1 flex items-center gap-2 border-l border-gray-300 dark:border-slate-600 pl-4">
          <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex-shrink-0">
            Supervisor:
          </label>

          {job.supervisors.length > 0 && (
            <div className="flex gap-1 flex-wrap">
              {job.supervisors.map((supervisor) => (
                <div
                  key={supervisor.pno}
                  className="inline-flex items-center gap-1 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded px-2 py-1 text-sm whitespace-nowrap"
                  title={`${supervisor.name} (${supervisor.pno})`}
                >
                  <FaCheckCircle className="text-purple-600 dark:text-purple-400 text-sm" />
                  <span className="text-purple-700 dark:text-purple-300">{supervisor.pno}</span>
                  <button
                    onClick={() => onRemoveSignature(section, job.id, 'supervisors', supervisor.pno)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FaTimes className="text-sm" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center gap-1 relative flex-shrink-0">
            <input
              type="text"
              placeholder="PNO/Name"
              value={searchPno[supervisorKey] || ''}
              onChange={(e) => onSearchInput(supervisorKey, e.target.value)}
              className="w-28 px-3 py-2 text-sm rounded border border-gray-300 dark:border-slate-600 dark:bg-slate-800 focus:ring-1 focus:ring-violet-500 outline-none"
            />

            {/* Suggestions */}
            <AnimatePresence>
              {searchSuggestions[supervisorKey]?.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="absolute z-20 top-full left-0 w-56 mt-1 bg-white dark:bg-slate-700 rounded-lg shadow-lg border border-gray-200 dark:border-slate-600 overflow-hidden"
                >
                  {searchSuggestions[supervisorKey].map((person) => (
                    <div
                      key={person.pno}
                      onClick={() => onSelectSuggestion(supervisorKey, person)}
                      className="px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-slate-600 cursor-pointer flex items-center gap-2 text-xs"
                    >
                      <span className="px-1.5 py-0.5 bg-violet-100 dark:bg-violet-900 text-violet-700 dark:text-violet-300 rounded text-xs font-medium">
                        {person.trade}
                      </span>
                      <span className="font-medium">{person.pno}</span>
                      <span className="text-gray-500 dark:text-gray-400 truncate">{person.name}</span>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            <input
              type="password"
              placeholder="PIN"
              value={supervisorPins[supervisorKey] || ''}
              onChange={(e) => setSupervisorPins({ ...supervisorPins, [supervisorKey]: e.target.value })}
              className="w-20 px-3 py-2 text-sm rounded border border-gray-300 dark:border-slate-600 dark:bg-slate-800 focus:ring-1 focus:ring-violet-500 outline-none"
            />
            <button
              onClick={() => onAddSupervisorSignature(section, job.id)}
              className="px-3 py-2 bg-purple-500 text-white text-sm rounded hover:bg-purple-600 transition whitespace-nowrap"
            >
              Sign
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ScheduleMaintenance;
