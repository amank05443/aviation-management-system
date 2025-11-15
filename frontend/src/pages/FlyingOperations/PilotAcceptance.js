import React from 'react';
import {
  FaCheckCircle, FaUserShield, FaUsers, FaPlane
} from 'react-icons/fa';

const PilotAcceptance = ({
  selectedTrades,
  assignedPersonnel,
  supervisorPno,
  PERSONNEL_DATABASE,
  aeData,
  pilotPin,
  setPilotPin,
  handlePilotAccept,
  PILOT_PIN
}) => {
  return (
    <div className="ops-section">
      <div className="ops-card">
        <div className="ops-card-content">
          <h2><FaUserShield /> Pilot Acceptance</h2>
          <p className="info-text">Review the work completed by FSI and accept the aircraft for flying operations.</p>

          {/* Work Summary for Pilot Review */}
          <div className="pilot-review-section">
            <h3><FaUsers /> Assigned Personnel & Signatures</h3>
            <div className="review-personnel-grid">
              {selectedTrades.map(trade => {
                const person = assignedPersonnel[trade];
                return (
                  <div key={trade} className="review-personnel-card">
                    <div className="review-badge">{trade}</div>
                    <div className="review-info">
                      <strong>{person.name}</strong>
                      <p>{person.rank} | {person.pno}</p>
                    </div>
                    <div className="review-status">
                      <FaCheckCircle className="text-green" /> Signed
                    </div>
                  </div>
                );
              })}

              {/* Supervisor */}
              {supervisorPno && PERSONNEL_DATABASE[supervisorPno.toUpperCase()] && (
                <div className="review-personnel-card supervisor-card">
                  <div className="review-badge supervisor-badge">SUP</div>
                  <div className="review-info">
                    <strong>{PERSONNEL_DATABASE[supervisorPno.toUpperCase()].name}</strong>
                    <p>{PERSONNEL_DATABASE[supervisorPno.toUpperCase()].rank} | {supervisorPno}</p>
                  </div>
                  <div className="review-status">
                    <FaCheckCircle className="text-green" /> Verified
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Aircraft Data Review (if AE was assigned) */}
          {selectedTrades.includes('AE') && aeData.fuelQty && (
            <div className="aircraft-data-review">
              <h3><FaPlane /> Aircraft Data (Completed by AE)</h3>
              <div className="data-review-grid">
                <div className="data-review-item">
                  <div className="data-label">Fuel Quantity</div>
                  <div className="data-value">{aeData.fuelQty} <span className="data-unit">Liters</span></div>
                </div>
                <div className="data-review-item">
                  <div className="data-label">Tyre Pressure</div>
                  <div className="data-value">{aeData.tyrePressure} <span className="data-unit">PSI</span></div>
                </div>
                <div className="data-review-item">
                  <div className="data-label">Oil Filled</div>
                  <div className="data-value">{aeData.oilFilled} <span className="data-unit">Liters</span></div>
                </div>
              </div>
              <div className="data-verified-by">
                <FaCheckCircle className="text-green" /> Data verified and locked by {assignedPersonnel['AE'].name}
              </div>
            </div>
          )}

          {/* Pilot Acceptance */}
          <div className="pilot-acceptance-box">
            <p className="acceptance-message">
              <FaCheckCircle /> All work has been completed and verified by FSI. Please review the above details and accept the aircraft.
            </p>
            <p className="hint">Pilot PIN: <strong>{PILOT_PIN}</strong></p>
            <div className="input-group">
              <input
                type="password"
                placeholder="Enter Pilot PIN to Accept Aircraft"
                value={pilotPin}
                onChange={(e) => setPilotPin(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handlePilotAccept()}
              />
              <button onClick={handlePilotAccept} className="btn-success btn-lg">
                <FaCheckCircle /> Accept Aircraft
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PilotAcceptance;
