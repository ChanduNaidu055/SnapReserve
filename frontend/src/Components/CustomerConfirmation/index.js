import React, { useState } from "react";
import axios from "axios";
import "./index.css";

const API_URL = process.env.REACT_APP_API_URL || "https://snapreserve-production.up.railway.app";

const CustomerConfirmation = () => {
  const [searchName, setSearchName] = useState("");
  const [results, setResults] = useState(null);
  const [searching, setSearching] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchName.trim()) return;
    setSearching(true);
    try {
      const response = await axios.get(`${API_URL}/api/bookings?customer_name=${searchName}`); 
      setResults(response.data);
      setSearching(false);
    } catch (err) {
      setSearching(false);
      setResults([]);
    }
  };

  return (
    <div className="confirmation-workspace">
      <div className="search-deck-card">
        <h1>Client Tracking Portal</h1>
        <p>Enter your full customer profile name to retrieve real-time reservation logging states and photographer schedules.</p>
        
        <form onSubmit={handleSearch} className="premium-search-box">
          <input type="text" placeholder="e.g., Johnathan Smith" value={searchName} onChange={(e) => setSearchName(e.target.value)} />
          <button type="submit" disabled={searching}>{searching ? "Syncing..." : "Query Database"}</button>
        </form>
      </div>

      <div className="search-results-viewport">
        {results && results.length === 0 && (
          <div className="no-records-card">⚠️ No active booking records identified under "{searchName}".</div>
        )}

        {results && results.length > 0 && (
          <div className="results-wrapper">
            <h3>Matching Studio Confirmations</h3>
            <div className="results-stack">
              {results.map((b) => (
                <div key={b.id} className="receipt-premium-card">
                  <div className="receipt-header">
                    <span>Reservation Code: <strong>#{b.id}</strong></span>
                    <span className={`badge-state ${b.status.toLowerCase()}`}>{b.status}</span>
                  </div>
                  <div className="receipt-body-grid">
                    <div className="grid-item-cell"><h5>Client Profile</h5><p>{b.customer_name}</p></div>
                    <div className="grid-item-cell"><h5>Production Window</h5><p>{b.date}</p></div>
                    <div className="grid-item-cell"><h5>Category Block</h5><p>{b.event_type}</p></div>
                    <div className="grid-item-cell"><h5>Special Requirements</h5><p>{b.special_requests || "None on file"}</p></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerConfirmation;