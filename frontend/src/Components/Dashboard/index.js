import React, { useState, useEffect } from "react";
import axios from "axios";
import { Oval } from "react-loader-spinner";
import { useNavigate } from "react-router-dom"; 
import "./index.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:4000";
//const API_URL = "http://localhost:4000";

const Dashboard = () => {
  const navigate = useNavigate(); 
  
  const [metrics, setMetrics] = useState(null);
  const [recentShoots, setRecentShoots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const metricsResponse = await axios.get(`${API_URL}/api/dashboard/studio`);
        setMetrics(metricsResponse.data);

     const bookingsResponse = await axios.get(`${API_URL}/api/bookings?limit=5`);
     setRecentShoots(Array.isArray(bookingsResponse.data) ? bookingsResponse.data : []);

        setLoading(false);
      } catch (err) {
        setError("Unable to sync dashboard analytics. Please verify backend state.");
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="dashboard-loader-container">
        <Oval
          height={70}
          width={70}
          color="#00bcd4"
          secondaryColor="#f3f3f3"
          ariaLabel="loading-analytics"
          visible={true}
        />
        <p>Syncing Studio Analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error-container">
        <div className="error-icon">⚠️</div>
        <h3>Analytics Sync Error</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-header">
        <div>
          <h1>Studio Analytics Overview</h1>
          <p>Real-time updates on your photography operations, booking streams, and utilization metrics.</p>
        </div>
        <div className="system-status-pill">
          <span className="status-indicator-dot"></span> System Live
        </div>
      </div>

      <div className="metrics-grid">
        <div 
          className="metric-card revenue-card" 
          onClick={() => navigate('/analytics')} 
          style={{ cursor: "pointer" }}
        >
          <div className="card-icon-wrapper">💵</div>
          <div className="metric-info">
            <h3>Total Package Revenue</h3>
            <p className="metric-value">${metrics?.package_revenue ?? 0}</p>
          </div>
        </div>
        <div 
          className="metric-card shoots-card" 
          onClick={() => navigate('/schedule')} 
          style={{ cursor: "pointer" }}
        >
          <div className="card-icon-wrapper">📸</div>
          <div className="metric-info">
            <h3>Upcoming Shoots</h3>
            <p className="metric-value">{metrics?.upcoming_shoots ?? 0}</p>
          </div>
        </div>

        <div 
          className="metric-card utilization-card" 
          onClick={() => navigate('/manage')} 
          style={{ cursor: "pointer" }}
        >
          <div className="card-icon-wrapper">👥</div>
          <div className="metric-info">
            <h3>Utilized Photographers</h3>
            <p className="metric-value">{metrics?.photographer_utilization ?? 0}</p>
          </div>
        </div>
      </div>

      <div className="dashboard-content-layout">
        <div className="activity-feed-panel">
          <h2>Upcoming Booking Queue</h2>
          {recentShoots.length === 0 ? (
            <div className="dashboard-empty-state">
              <p>No active reservations on file. New bookings will appear here.</p>
            </div>
          ) : (
            <div className="shoot-list-container">
              {recentShoots.map((shoot) => (
                <div key={shoot.id} className="shoot-list-item">
                  <div className="shoot-meta-block">
                    <span className="shoot-date">{shoot.date}</span>
                    <span className="shoot-client">{shoot.customer_name}</span>
                  </div>
                  <div className="shoot-details-block">
                    <span className="shoot-tag">{shoot.event_type}</span>
                    <span className={`status-pill ${shoot.status.toLowerCase()}`}>
                      {shoot.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="quick-actions-panel">
          <h2>Workspace System Statuses</h2>
          <div className="status-guide-list">
            <div className="guide-item">
              <span className="guide-bullet pending"></span>
              <div>
                <h4>Pending Status</h4>
                <p>Awaiting operational scheduling validation checks.</p>
              </div>
            </div>
            <div className="guide-item">
              <span className="guide-bullet confirmed"></span>
              <div>
                <h4>Confirmed Status</h4>
                <p>Photographer locked in. Overlap guard protection active.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;