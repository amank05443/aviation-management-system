import React from 'react';
import {
  FaCheckCircle, FaClipboardCheck, FaExclamationTriangle, FaLock,
  FaUserShield, FaTools, FaUsers, FaSearch, FaChevronRight,
  FaPlane, FaInfoCircle
} from 'react-icons/fa';

const PostFlying = ({
  // Flight Status
  flightStatus,
  defectStatus,
  flightData,
  setFlightData,
  handleFlightStatusSelect,
  handleDefectStatusSelect,

  // Pilot Authentication
  postPilotPin,
  setPostPilotPin,
  handlePilotDataAuth,
  pilotDataAuthenticated,
  PILOT_PIN,

  // AFS Workflow
  afsStage,
  afsFsiPin,
  setAfsFsiPin,
  afsFsiAuthenticated,
  handleAFSFsiAuth,
  FSI_PIN,

  // AFS Personnel
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

  // AFS Signatures
  afsTradesmenSignatures,
  afsTradesmenPins,
  setAfsTradesmenPins,
  handleAfsTradesmanSign,
  handleAfsSupervisorSign,
  handleCompleteAfs,

  // Other
  handleReset
}) => {
  return (
    <div className="ops-section">
      <div className="ops-card">
        <div className="ops-card-content">
          <h2><FaClipboardCheck /> Post Flying Operations</h2>
          <p className="info-text">Select flight status and complete post-flight reporting</p>

          {/* Step 1: Flight Status Selection */}
          {!flightStatus && (
            <div className="flight-status-section">
              <h3>Select Flight Status</h3>
              <div className="status-options-grid">
                <div
                  className="status-option-card completed-card"
                  onClick={() => handleFlightStatusSelect('completed')}
                >
                  <FaCheckCircle className="status-icon" />
                  <h4>Flying Completed</h4>
                  <p>Aircraft completed the mission successfully</p>
                </div>
                <div
                  className="status-option-card terminated-card"
                  onClick={() => handleFlightStatusSelect('terminated')}
                >
                  <FaExclamationTriangle className="status-icon" />
                  <h4>Flying Terminated</h4>
                  <p>Mission was terminated before completion</p>
                </div>
                <div
                  className="status-option-card not-flown-card"
                  onClick={() => handleFlightStatusSelect('not_flown')}
                >
                  <FaLock className="status-icon" />
                  <h4>Aircraft Not Flown</h4>
                  <p>Aircraft did not take off</p>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Defect Status Selection */}
          {flightStatus && !defectStatus && (
            <div className="defect-status-section">
              <div className="selected-status-badge">
                <FaCheckCircle /> Flight Status: <strong>{flightStatus.replace('_', ' ').toUpperCase()}</strong>
              </div>
              <h3>Defect Status</h3>
              <div className="defect-options-grid">
                <div
                  className="defect-option-card no-defect-card"
                  onClick={() => handleDefectStatusSelect('no_defect')}
                >
                  <FaCheckCircle className="defect-icon" />
                  <h4>No Defect</h4>
                  <p>Aircraft has no reported defects</p>
                </div>
                <div
                  className="defect-option-card with-defect-card"
                  onClick={() => handleDefectStatusSelect('with_defect')}
                >
                  <FaExclamationTriangle className="defect-icon" />
                  <h4>With Defect</h4>
                  <p>Aircraft has defects to report</p>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Flight Data Entry (for Completed + No Defect) */}
          {flightStatus === 'completed' && defectStatus === 'no_defect' && !pilotDataAuthenticated && (
            <div className="flight-data-section">
              <div className="status-summary">
                <FaCheckCircle /> <strong>Flying Completed</strong> - No Defect
              </div>
              <h3>Enter Flight Data</h3>

              <div className="flight-data-grid">
                <div className="input-field">
                  <label>Number of Landings: <span className="required-mark">*</span></label>
                  <input
                    type="number"
                    value={flightData.landings}
                    onChange={(e) => setFlightData({ ...flightData, landings: e.target.value })}
                    placeholder="Enter number of landings"
                  />
                </div>
                <div className="input-field">
                  <label>Airframe Hours: <span className="required-mark">*</span></label>
                  <input
                    type="number"
                    step="0.1"
                    value={flightData.airframeHours}
                    onChange={(e) => setFlightData({ ...flightData, airframeHours: e.target.value })}
                    placeholder="Enter airframe hours"
                  />
                </div>
              </div>

              <div className="pilot-auth-box">
                <p className="auth-message">
                  <FaUserShield /> Pilot must authenticate to confirm flight data
                </p>
                <p className="hint">Pilot PIN: <strong>{PILOT_PIN}</strong></p>
                <div className="input-group">
                  <input
                    type="password"
                    placeholder="Enter Pilot PIN"
                    value={postPilotPin}
                    onChange={(e) => setPostPilotPin(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handlePilotDataAuth()}
                  />
                  <button onClick={handlePilotDataAuth} className="btn-success btn-lg">
                    <FaCheckCircle /> Authenticate & Proceed to AFS
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: AFS (After Flying Servicing) Workflow */}
          {pilotDataAuthenticated && (
            <div className="afs-workflow">
              <div className="afs-header">
                <h2><FaTools /> AFS - After Flying Servicing</h2>
                <p className="afs-subtitle">Aircraft is ready for after-flight servicing</p>
              </div>

              {/* AFS Stage 0: FSI Assignment */}
              {afsStage === 0 && (
                <div className="afs-assignment-section">
                  <h3>FSI Verification & AFS Work Assignment</h3>

                  {!afsFsiAuthenticated ? (
                    <div className="auth-box">
                      <p className="hint">FSI PIN: <strong>{FSI_PIN}</strong></p>
                      <div className="input-group">
                        <input
                          type="password"
                          placeholder="Enter FSI PIN"
                          value={afsFsiPin}
                          onChange={(e) => setAfsFsiPin(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleAFSFsiAuth()}
                        />
                        <button onClick={handleAFSFsiAuth} className="btn-primary">
                          <FaCheckCircle /> Authenticate
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="assignment-section">
                      {/* Trade Selection */}
                      <div className="form-group">
                        <label>Select Trades for AFS:</label>
                        <div className="trade-grid">
                          {['AE', 'AL', 'AR', 'AO'].map(trade => (
                            <div
                              key={trade}
                              className={`trade-card ${afsSelectedTrades.includes(trade) ? 'selected' : ''}`}
                              onClick={() => toggleAfsTrade(trade)}
                            >
                              <div className="trade-name">{trade}</div>
                              {afsAssignedPersonnel[trade] && (
                                <div className="assigned-info">
                                  <FaCheckCircle /> {afsAssignedPersonnel[trade].name}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Personnel Search */}
                      {afsSelectedTrades.length > 0 && (
                        <div className="form-group">
                          <label>Search & Assign Personnel:</label>
                          <div className="search-box-wrapper">
                            <div className="search-box">
                              <input
                                type="text"
                                placeholder="Enter PNO or Name"
                                value={afsSearchPno}
                                onChange={(e) => handleAfsSearchInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleAfsSearchPersonnel()}
                              />
                              <button onClick={handleAfsSearchPersonnel} className="btn-secondary">
                                <FaSearch /> Search
                              </button>
                            </div>

                            {/* Live Suggestions */}
                            {afsSearchSuggestions.length > 0 && (
                              <div className="search-suggestions">
                                {afsSearchSuggestions.map((person) => (
                                  <div
                                    key={person.pno}
                                    className="suggestion-item"
                                    onClick={() => handleAfsSelectSuggestion(person)}
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

                          {afsSearchResults && (
                            <div className="search-result">
                              <div className="personnel-info">
                                <p><strong>PNO:</strong> {afsSearchResults.pno}</p>
                                <p><strong>Name:</strong> {afsSearchResults.name}</p>
                                <p><strong>Rank:</strong> {afsSearchResults.rank}</p>
                                <p><strong>Trade:</strong> {afsSearchResults.trade}</p>
                              </div>
                              {afsSelectedTrades.includes(afsSearchResults.trade) && !afsAssignedPersonnel[afsSearchResults.trade] && (
                                <button
                                  onClick={() => handleAfsAssignToTrade(afsSearchResults.trade)}
                                  className="btn-success"
                                >
                                  Assign to {afsSearchResults.trade}
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
                          value={afsSupervisorPno}
                          onChange={(e) => setAfsSupervisorPno(e.target.value)}
                        />
                        {afsSupervisorPno && PERSONNEL_DATABASE[afsSupervisorPno.toUpperCase()] && (
                          <p className="supervisor-info">
                            <FaCheckCircle /> {PERSONNEL_DATABASE[afsSupervisorPno.toUpperCase()].name} - {PERSONNEL_DATABASE[afsSupervisorPno.toUpperCase()].rank}
                          </p>
                        )}
                      </div>

                      <button onClick={handleAfsCompleteAssignment} className="btn-primary btn-lg">
                        <FaChevronRight /> Complete AFS Assignment
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* AFS Stage 1: Work Completion */}
              {afsStage === 1 && (
                <div className="afs-work-section">
                  <h3><FaUsers /> AFS Work Completion & Signatures</h3>

                  <div className="signatures-grid">
                    {afsSelectedTrades.map(trade => {
                      const person = afsAssignedPersonnel[trade];
                      const signed = afsTradesmenSignatures[trade];

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
                                value={afsTradesmenPins[trade] || ''}
                                onChange={(e) => setAfsTradesmenPins({ ...afsTradesmenPins, [trade]: e.target.value })}
                                onKeyPress={(e) => e.key === 'Enter' && handleAfsTradesmanSign(trade)}
                              />
                              <button onClick={() => handleAfsTradesmanSign(trade)} className="btn-primary">
                                Sign
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* Supervisor Signature */}
                    {afsSupervisorPno && PERSONNEL_DATABASE[afsSupervisorPno.toUpperCase()] && (
                      <div className={`signature-card ${afsTradesmenSignatures.supervisor ? 'signed' : ''}`}>
                        <div className="signature-header">
                          <div className="person-info">
                            <h4>Supervisor - {PERSONNEL_DATABASE[afsSupervisorPno.toUpperCase()].name}</h4>
                            <p>{PERSONNEL_DATABASE[afsSupervisorPno.toUpperCase()].rank} | {afsSupervisorPno}</p>
                          </div>
                          {afsTradesmenSignatures.supervisor && <FaCheckCircle className="signed-icon" />}
                        </div>
                        {!afsTradesmenSignatures.supervisor && (
                          <div className="signature-input">
                            <p className="hint">PIN: <strong>{PERSONNEL_DATABASE[afsSupervisorPno.toUpperCase()].pin}</strong></p>
                            <input
                              type="password"
                              placeholder="Enter PIN"
                              value={afsTradesmenPins.supervisor || ''}
                              onChange={(e) => setAfsTradesmenPins({ ...afsTradesmenPins, supervisor: e.target.value })}
                              onKeyPress={(e) => e.key === 'Enter' && handleAfsSupervisorSign()}
                            />
                            <button onClick={handleAfsSupervisorSign} className="btn-primary">
                              Sign
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <button onClick={handleCompleteAfs} className="btn-success btn-lg">
                    <FaCheckCircle /> Complete AFS
                  </button>
                </div>
              )}

              {/* AFS Stage 2: Completion */}
              {afsStage === 2 && (
                <div className="completion-box">
                  <FaCheckCircle className="completion-icon" />
                  <h3>Flight Operation Cycle Completed!</h3>
                  <p>All stages including AFS have been completed successfully</p>
                  <button onClick={handleReset} className="btn-primary btn-lg">
                    <FaPlane /> Start New Operation
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Other Flight Status Outcomes */}
          {((flightStatus && defectStatus === 'with_defect') ||
            (flightStatus === 'terminated' && defectStatus) ||
            (flightStatus === 'not_flown' && defectStatus)) && !pilotDataAuthenticated && (
            <div className="alternate-outcome">
              <div className="outcome-message">
                <FaInfoCircle className="outcome-icon" />
                <div>
                  <h3>Flight Status Recorded</h3>
                  <p>Status: <strong>{flightStatus.replace('_', ' ').toUpperCase()}</strong></p>
                  <p>Defect: <strong>{defectStatus.replace('_', ' ').toUpperCase()}</strong></p>
                  <p className="outcome-note">Aircraft will require maintenance attention before next flight.</p>
                </div>
              </div>
              <button onClick={handleReset} className="btn-primary btn-lg">
                <FaPlane /> Start New Operation
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostFlying;
