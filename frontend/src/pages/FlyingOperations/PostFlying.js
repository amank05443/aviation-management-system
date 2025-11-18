import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaCheckCircle, FaClipboardCheck, FaExclamationTriangle, FaLock,
  FaUserShield, FaTools, FaUsers, FaSearch, FaChevronRight,
  FaPlane, FaInfoCircle
} from 'react-icons/fa';

const PostFlying = ({
  flightStatus,
  defectStatus,
  flightData,
  setFlightData,
  handleFlightStatusSelect,
  handleDefectStatusSelect,
  postPilotPin,
  setPostPilotPin,
  handlePilotDataAuth,
  pilotDataAuthenticated,
  PILOT_PIN,
  afsStage,
  afsFsiPin,
  setAfsFsiPin,
  afsFsiAuthenticated,
  handleAFSFsiAuth,
  FSI_PIN,
  afsSelectedTrades,
  toggleAfsTrade,
  afsAssignedPersonnel,
  afsSearchPno,
  handleAfsSearchInput,
  handleAfsSearchPersonnel,
  afsSearchSuggestions,
  handleAfsSelectSuggestion,
  afsSearchResults,
  handleAfsAssignToTrade,
  afsSupervisorPno,
  setAfsSupervisorPno,
  PERSONNEL_DATABASE,
  handleAfsCompleteAssignment,
  afsTradesmenSignatures,
  afsTradesmenPins,
  setAfsTradesmenPins,
  handleAfsTradesmanSign,
  handleAfsSupervisorSign,
  handleCompleteAfs,
  handleReset
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex-1 bg-white dark:bg-slate-800 rounded-lg shadow-md p-3 overflow-y-auto"
    >
      <div className="space-y-3">
        <h2 className="text-sm font-semibold flex items-center gap-2 text-violet-600 dark:text-violet-400">
          <FaClipboardCheck /> Post Flying Operations
        </h2>

        {/* Flight Status Selection */}
        {!flightStatus && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            <h3 className="text-xs font-medium">Select Flight Status:</h3>
            <div className="grid grid-cols-3 gap-2">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleFlightStatusSelect('completed')}
                className="p-2 rounded-lg cursor-pointer bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 hover:border-green-400 text-center"
              >
                <FaCheckCircle className="text-green-500 mx-auto mb-1" />
                <p className="text-xs font-medium">Completed</p>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleFlightStatusSelect('terminated')}
                className="p-2 rounded-lg cursor-pointer bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 hover:border-amber-400 text-center"
              >
                <FaExclamationTriangle className="text-amber-500 mx-auto mb-1" />
                <p className="text-xs font-medium">Terminated</p>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleFlightStatusSelect('not_flown')}
                className="p-2 rounded-lg cursor-pointer bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 hover:border-gray-400 text-center"
              >
                <FaLock className="text-gray-500 mx-auto mb-1" />
                <p className="text-xs font-medium">Not Flown</p>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Defect Status Selection */}
        {flightStatus && !defectStatus && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            <div className="flex items-center gap-2 text-xs">
              <span className="px-2 py-1 bg-violet-100 dark:bg-violet-900 text-violet-700 dark:text-violet-300 rounded font-medium">
                {flightStatus.replace('_', ' ').toUpperCase()}
              </span>
            </div>
            <h3 className="text-xs font-medium">Defect Status:</h3>
            <div className="grid grid-cols-2 gap-2">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleDefectStatusSelect('no_defect')}
                className="p-2 rounded-lg cursor-pointer bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 hover:border-green-400 text-center"
              >
                <FaCheckCircle className="text-green-500 mx-auto mb-1" />
                <p className="text-xs font-medium">No Defect</p>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleDefectStatusSelect('with_defect')}
                className="p-2 rounded-lg cursor-pointer bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 hover:border-red-400 text-center"
              >
                <FaExclamationTriangle className="text-red-500 mx-auto mb-1" />
                <p className="text-xs font-medium">With Defect</p>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Flight Data Entry */}
        {flightStatus === 'completed' && defectStatus === 'no_defect' && !pilotDataAuthenticated && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            <div className="flex items-center gap-2 text-xs mb-2">
              <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded font-medium">
                COMPLETED - NO DEFECT
              </span>
            </div>
            <h3 className="text-xs font-medium">Enter Flight Data:</h3>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-gray-600 dark:text-gray-400">Landings</label>
                <input
                  type="number"
                  value={flightData.landings}
                  onChange={(e) => setFlightData({ ...flightData, landings: e.target.value })}
                  className="w-full px-2 py-1.5 text-xs rounded border border-gray-300 dark:border-slate-600 dark:bg-slate-800"
                  placeholder="Number"
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-600 dark:text-gray-400">Airframe Hours</label>
                <input
                  type="number"
                  step="0.1"
                  value={flightData.airframeHours}
                  onChange={(e) => setFlightData({ ...flightData, airframeHours: e.target.value })}
                  className="w-full px-2 py-1.5 text-xs rounded border border-gray-300 dark:border-slate-600 dark:bg-slate-800"
                  placeholder="Hours"
                />
              </div>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg">
              <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-1">Pilot PIN: <strong>{PILOT_PIN}</strong></p>
              <div className="flex gap-2">
                <input
                  type="password"
                  placeholder="Enter Pilot PIN"
                  value={postPilotPin}
                  onChange={(e) => setPostPilotPin(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handlePilotDataAuth()}
                  className="flex-1 px-2 py-1.5 text-xs rounded border border-blue-300 dark:border-blue-700 dark:bg-slate-800"
                />
                <button
                  onClick={handlePilotDataAuth}
                  className="px-2 py-1.5 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition"
                >
                  Proceed to AFS
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* AFS Workflow */}
        {pilotDataAuthenticated && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <div className="bg-violet-50 dark:bg-violet-900/20 p-2 rounded-lg">
              <h3 className="text-xs font-medium flex items-center gap-1 text-violet-700 dark:text-violet-400">
                <FaTools /> AFS - After Flying Servicing
              </h3>
            </div>

            {/* AFS Stage 0: FSI Assignment */}
            {afsStage === 0 && (
              <div className="space-y-2">
                {!afsFsiAuthenticated ? (
                  <div className="bg-gray-50 dark:bg-slate-700 p-2 rounded-lg">
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-1">FSI PIN: <strong>{FSI_PIN}</strong></p>
                    <div className="flex gap-2">
                      <input
                        type="password"
                        placeholder="Enter FSI PIN"
                        value={afsFsiPin}
                        onChange={(e) => setAfsFsiPin(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAFSFsiAuth()}
                        className="flex-1 px-2 py-1.5 text-xs rounded border border-gray-300 dark:border-slate-600 dark:bg-slate-800"
                      />
                      <button
                        onClick={handleAFSFsiAuth}
                        className="px-2 py-1.5 bg-violet-600 text-white text-xs rounded hover:bg-violet-700"
                      >
                        Auth
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {/* Trade Selection */}
                    <div>
                      <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 block">Trades:</label>
                      <div className="grid grid-cols-4 gap-1.5">
                        {['AE', 'AL', 'AR', 'AO'].map(trade => (
                          <motion.div
                            key={trade}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => toggleAfsTrade(trade)}
                            className={`p-1.5 rounded cursor-pointer text-center text-xs
                              ${afsSelectedTrades.includes(trade)
                                ? 'bg-violet-100 dark:bg-violet-900/30 border-2 border-violet-500'
                                : 'bg-gray-100 dark:bg-slate-700 border-2 border-transparent'}`}
                          >
                            <div className="font-bold">{trade}</div>
                            {afsAssignedPersonnel[trade] && (
                              <FaCheckCircle className="text-green-500 text-[10px] mx-auto" />
                            )}
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Personnel Search */}
                    {afsSelectedTrades.length > 0 && (
                      <div className="relative">
                        <div className="flex gap-1.5">
                          <input
                            type="text"
                            placeholder="PNO or Name"
                            value={afsSearchPno}
                            onChange={(e) => handleAfsSearchInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleAfsSearchPersonnel()}
                            className="flex-1 px-2 py-1.5 text-xs rounded border border-gray-300 dark:border-slate-600 dark:bg-slate-800"
                          />
                          <button
                            onClick={handleAfsSearchPersonnel}
                            className="px-2 py-1.5 bg-gray-200 dark:bg-slate-600 text-xs rounded"
                          >
                            <FaSearch />
                          </button>
                        </div>

                        <AnimatePresence>
                          {afsSearchSuggestions.length > 0 && (
                            <motion.div
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -5 }}
                              className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-700 rounded-lg shadow-lg border border-gray-200 dark:border-slate-600 overflow-hidden"
                            >
                              {afsSearchSuggestions.map((person) => (
                                <div
                                  key={person.pno}
                                  onClick={() => handleAfsSelectSuggestion(person)}
                                  className="px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-slate-600 cursor-pointer flex items-center gap-2 text-xs"
                                >
                                  <span className="px-1.5 py-0.5 bg-violet-100 dark:bg-violet-900 text-violet-700 dark:text-violet-300 rounded text-[10px] font-medium">
                                    {person.trade}
                                  </span>
                                  <span>{person.name}</span>
                                </div>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {afsSearchResults && (
                          <div className="mt-2 p-2 bg-gray-50 dark:bg-slate-700 rounded-lg flex justify-between items-center">
                            <div className="text-xs">
                              <strong>{afsSearchResults.name}</strong> ({afsSearchResults.trade})
                            </div>
                            {afsSelectedTrades.includes(afsSearchResults.trade) && !afsAssignedPersonnel[afsSearchResults.trade] && (
                              <button
                                onClick={() => handleAfsAssignToTrade(afsSearchResults.trade)}
                                className="px-2 py-1 bg-green-500 text-white text-[10px] rounded"
                              >
                                + Assign
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Supervisor */}
                    <div>
                      <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 block">Supervisor:</label>
                      <input
                        type="text"
                        placeholder="SUP001"
                        value={afsSupervisorPno}
                        onChange={(e) => setAfsSupervisorPno(e.target.value)}
                        className="w-full px-2 py-1.5 text-xs rounded border border-gray-300 dark:border-slate-600 dark:bg-slate-800"
                      />
                      {afsSupervisorPno && PERSONNEL_DATABASE[afsSupervisorPno.toUpperCase()] && (
                        <p className="text-[10px] text-green-600 dark:text-green-400 mt-1 flex items-center gap-1">
                          <FaCheckCircle /> {PERSONNEL_DATABASE[afsSupervisorPno.toUpperCase()].name}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={handleAfsCompleteAssignment}
                      className="w-full py-1.5 bg-violet-600 text-white text-xs font-medium rounded hover:bg-violet-700 transition flex items-center justify-center gap-1"
                    >
                      Complete Assignment <FaChevronRight />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* AFS Stage 1: Work Completion */}
            {afsStage === 1 && (
              <div className="space-y-2">
                <h3 className="text-xs font-medium flex items-center gap-1">
                  <FaUsers className="text-violet-500" /> AFS Work Completion
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {afsSelectedTrades.map(trade => {
                    const person = afsAssignedPersonnel[trade];
                    const signed = afsTradesmenSignatures[trade];
                    return (
                      <div
                        key={trade}
                        className={`p-2 rounded-lg border ${signed ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'bg-gray-50 dark:bg-slate-700 border-gray-200 dark:border-slate-600'}`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <div>
                            <p className="text-xs font-medium">{trade} - {person.name}</p>
                          </div>
                          {signed && <FaCheckCircle className="text-green-500 text-xs" />}
                        </div>
                        {!signed && (
                          <div className="flex gap-1">
                            <input
                              type="password"
                              placeholder={`PIN (${person.pin})`}
                              value={afsTradesmenPins[trade] || ''}
                              onChange={(e) => setAfsTradesmenPins({ ...afsTradesmenPins, [trade]: e.target.value })}
                              className="flex-1 px-1.5 py-1 text-[10px] rounded border border-gray-300 dark:border-slate-600 dark:bg-slate-800"
                            />
                            <button
                              onClick={() => handleAfsTradesmanSign(trade)}
                              className="px-2 py-1 bg-violet-600 text-white text-[10px] rounded"
                            >
                              Sign
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Supervisor */}
                  {afsSupervisorPno && PERSONNEL_DATABASE[afsSupervisorPno.toUpperCase()] && (
                    <div
                      className={`p-2 rounded-lg border ${afsTradesmenSignatures.supervisor ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'bg-gray-50 dark:bg-slate-700 border-gray-200 dark:border-slate-600'}`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <div>
                          <p className="text-xs font-medium">SUP - {PERSONNEL_DATABASE[afsSupervisorPno.toUpperCase()].name}</p>
                        </div>
                        {afsTradesmenSignatures.supervisor && <FaCheckCircle className="text-green-500 text-xs" />}
                      </div>
                      {!afsTradesmenSignatures.supervisor && (
                        <div className="flex gap-1">
                          <input
                            type="password"
                            placeholder={`PIN (${PERSONNEL_DATABASE[afsSupervisorPno.toUpperCase()].pin})`}
                            value={afsTradesmenPins.supervisor || ''}
                            onChange={(e) => setAfsTradesmenPins({ ...afsTradesmenPins, supervisor: e.target.value })}
                            className="flex-1 px-1.5 py-1 text-[10px] rounded border border-gray-300 dark:border-slate-600 dark:bg-slate-800"
                          />
                          <button
                            onClick={handleAfsSupervisorSign}
                            className="px-2 py-1 bg-violet-600 text-white text-[10px] rounded"
                          >
                            Sign
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <button
                  onClick={handleCompleteAfs}
                  className="w-full py-1.5 bg-green-500 text-white text-xs font-medium rounded hover:bg-green-600 transition flex items-center justify-center gap-1"
                >
                  <FaCheckCircle /> Complete AFS
                </button>
              </div>
            )}

            {/* AFS Stage 2: Completion */}
            {afsStage === 2 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4 rounded-lg text-center"
              >
                <FaCheckCircle className="text-green-500 text-2xl mx-auto mb-2" />
                <h3 className="text-sm font-bold text-green-700 dark:text-green-400">Operation Complete!</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">All stages including AFS completed</p>
                <button
                  onClick={handleReset}
                  className="px-4 py-2 bg-violet-600 text-white text-xs font-medium rounded hover:bg-violet-700 transition flex items-center justify-center gap-1 mx-auto"
                >
                  <FaPlane /> New Operation
                </button>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Other Outcomes */}
        {((flightStatus && defectStatus === 'with_defect') ||
          (flightStatus === 'terminated' && defectStatus) ||
          (flightStatus === 'not_flown' && defectStatus)) && !pilotDataAuthenticated && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-3 rounded-lg"
          >
            <div className="flex items-start gap-2 mb-3">
              <FaInfoCircle className="text-amber-500 mt-0.5" />
              <div>
                <h3 className="text-xs font-bold">Status Recorded</h3>
                <p className="text-[10px] text-gray-600 dark:text-gray-400">
                  {flightStatus.replace('_', ' ').toUpperCase()} - {defectStatus.replace('_', ' ').toUpperCase()}
                </p>
                <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-1">
                  Aircraft requires maintenance before next flight.
                </p>
              </div>
            </div>
            <button
              onClick={handleReset}
              className="w-full py-1.5 bg-violet-600 text-white text-xs font-medium rounded hover:bg-violet-700 transition flex items-center justify-center gap-1"
            >
              <FaPlane /> New Operation
            </button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default PostFlying;
