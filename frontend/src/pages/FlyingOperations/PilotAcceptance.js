import React from 'react';
import { motion } from 'framer-motion';
import {
  FaCheckCircle, FaUserShield, FaUsers, FaPlane
} from 'react-icons/fa';

const PilotAcceptance = ({
  selectedTrades,
  assignedPersonnel,
  PERSONNEL_DATABASE,
  aeData,
  pilotPin,
  setPilotPin,
  handlePilotAccept,
  PILOT_PIN
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex-1 bg-white dark:bg-slate-800 rounded-lg shadow-md p-5 overflow-y-auto"
    >
      <div className="space-y-5">
        <h2 className="text-xl font-semibold flex items-center gap-3 text-violet-600 dark:text-violet-400">
          <FaUserShield /> Pilot Acceptance
        </h2>
        <p className="text-base text-gray-500 dark:text-gray-400">
          Review the completed work and accept the aircraft for flight.
        </p>

        {/* Personnel Summary */}
        <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg">
          <h3 className="text-base font-medium flex items-center gap-2 mb-4">
            <FaUsers className="text-violet-500" /> Assigned Personnel
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {selectedTrades.map(trade => (
              (assignedPersonnel[trade] || []).map(person => (
                <motion.div
                  key={`${trade}-${person.pno}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between bg-white dark:bg-slate-600 px-3 py-2 rounded text-base"
                >
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-violet-100 dark:bg-violet-900 text-violet-700 dark:text-violet-300 rounded text-sm font-medium">
                      {trade}
                    </span>
                    <span className="font-medium truncate">{person.name}</span>
                  </div>
                  <FaCheckCircle className="text-green-500" />
                </motion.div>
              ))
            ))}

          </div>
        </div>

        {/* Aircraft Data */}
        {selectedTrades.includes('AE') && aeData.fuelQty && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-lg"
          >
            <h3 className="text-base font-medium flex items-center gap-2 mb-4 text-blue-700 dark:text-blue-400">
              <FaPlane /> Aircraft Data (AE)
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white dark:bg-slate-700 p-3 rounded text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">Fuel</p>
                <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{aeData.fuelQty} <span className="text-sm font-normal">L</span></p>
              </div>
              <div className="bg-white dark:bg-slate-700 p-3 rounded text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">Tyre</p>
                <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{aeData.tyrePressure} <span className="text-sm font-normal">PSI</span></p>
              </div>
              <div className="bg-white dark:bg-slate-700 p-3 rounded text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">Oil</p>
                <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{aeData.oilFilled} <span className="text-sm font-normal">L</span></p>
              </div>
            </div>
            <p className="text-sm text-green-600 dark:text-green-400 mt-3 flex items-center gap-2">
              <FaCheckCircle /> Verified by {assignedPersonnel['AE']?.[0]?.name}
            </p>
          </motion.div>
        )}

        {/* Accept Aircraft */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4 rounded-lg"
        >
          <p className="text-base text-green-700 dark:text-green-400 mb-3 flex items-center gap-2">
            <FaCheckCircle /> All work completed and verified by FSI
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Pilot PIN: <strong>{PILOT_PIN}</strong></p>
          <div className="flex gap-3">
            <input
              type="password"
              placeholder="Enter Pilot PIN"
              value={pilotPin}
              onChange={(e) => setPilotPin(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handlePilotAccept()}
              className="flex-1 px-4 py-2.5 text-base rounded border border-green-300 dark:border-green-700 dark:bg-slate-800 focus:ring-2 focus:ring-green-500 outline-none"
            />
            <button
              onClick={handlePilotAccept}
              className="px-5 py-2.5 bg-green-500 text-white text-base font-medium rounded hover:bg-green-600 transition flex items-center gap-2"
            >
              <FaCheckCircle /> Accept
            </button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default PilotAcceptance;
