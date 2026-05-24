import React, { useState, useEffect } from "react";
import axios from "axios";
import { Oval } from "react-loader-spinner";
import "./index.css";

const API_URL = process.env.REACT_APP_API_URL || "https://snapreserve-production.up.railway.app";

const PhotographerSchedule = () => {
  const [photographers, setPhotographers] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [schedule, setSchedule] = useState([]);
  const [loadingSchedule, setLoadingSchedule] = useState(false);

  useEffect(() => {
    const fetchPhotographers = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/photographers/availability`);
        setPhotographers(response.data);
      } catch (err) { console.error(err); }
    };
    fetchPhotographers();
  }, []);

  useEffect(() => {
    const fetchSchedule = async () => {
      if (!selectedId) return;
      setLoadingSchedule(true);
      try {
        const response = await axios.get(`${API_URL}/api/bookings?photographer_id=${selectedId}`);
        const sortedData = (response.data || []).sort((a, b) => new Date(a.date) - new Date(b.date));
        setSchedule(sortedData);
        setLoadingSchedule(false);
      } catch (err) { setLoadingSchedule(false); }
    };
    fetchSchedule();
  }, [selectedId]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric"
    });
  };

  const confirmedCount = schedule.filter(s => s.status === 'Confirmed').length;

  return (
    <div className="schedule-workspace animate-fade-in">
      <div className="schedule-header-deck">
        <div>
          <h1>Photographer Timeline</h1>
          <p>Review studio resource allocations and assignments.</p>
        </div>
        <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)} className="modern-dropdown">
          <option value="">Choose Photographer...</option>
          {photographers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>

      {selectedId && !loadingSchedule && (
        <div className="stats-bar">
          <div className="stat-card">
            <span>Total Sessions</span>
            <strong>{schedule.length}</strong>
          </div>
          <div className="stat-card">
            <span>Confirmed</span>
            <strong style={{ color: "#059669" }}>{confirmedCount}</strong>
          </div>
        </div>
      )}

      <div className="timeline-container-lane">
        {loadingSchedule ? (
          <div className="inner-loader"><Oval height={45} width={45} color="#00bcd4" visible={true} /></div>
        ) : !selectedId ? (
          <div className="schedule-empty-view">Select a team photographer from the dropdown to visualize their timeline.</div>
        ) : schedule.length === 0 ? (
          <div className="schedule-empty-view">✨ This team operator's schedule is currently clear. Available for bookings!</div>
        ) : (
          <div className="timeline-stream">
            {schedule.map((b) => (
              <div key={b.id} className="stream-item">
                <div className="stream-marker"></div>
                <div className="stream-content">
                  <span className="stream-date">📅 {formatDate(b.date)}</span>
                  <h4>{b.event_type}</h4>
                  <p>Client: <strong>{b.customer_name}</strong></p>
                  <span className={`status-tag-pill ${b.status.toLowerCase()}`}>{b.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PhotographerSchedule;