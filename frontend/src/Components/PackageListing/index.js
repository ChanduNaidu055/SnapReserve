import React, { useState, useEffect } from "react";
import axios from "axios";
import { Oval } from "react-loader-spinner";
import "./index.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:4000";
//const API_URL = "http://localhost:4000";

const PackageListing = () => {
  const [packages, setPackages] = useState([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("");
  const [services, setServices] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchPackages = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/packages`); 
      setPackages(Array.isArray(response.data) ? response.data : []);
      setLoading(false);
    } catch (err) {
      setError("Failed to synchronize studio pricing tables.");
      setLoading(false);
    }
  };

  useEffect(() => { fetchPackages(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !price || !duration || !services) {
      alert("Validation error: All field configurations are required.");
      return;
    }
    try {
      await axios.post(`${API_URL}/api/packages`, { name, price: parseInt(price), duration, services }); 
      alert("Studio service package deployed successfully!");
      setName(""); setPrice(""); setDuration(""); setServices("");
      fetchPackages();
    } catch (err) {
      alert("Failed to create package schema.");
    }
  };

  if (loading) {
    return (
      <div className="center-loader">
        <Oval height={60} width={60} color="#00bcd4" secondaryColor="#f3f3f3" visible={true} />
      </div>
    );
  }

  return (
    <div className="packages-workspace animate-fade-in">
      <div className="workspace-hero">
        <h1>Studio Service Packages</h1>
        <p>Configure internal collection matrices, rate sheets, and production offerings.</p>
      </div>

      <div className="packages-split-layout">
        <div className="form-card-panel">
          <h3>Create New Bundle</h3>
          <form onSubmit={handleSubmit} className="premium-form">
            <div className="input-group">
              <label>Package Title</label>
              <input type="text" placeholder="e.g., Cinematic Wedding Elite" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="input-group">
              <label>Base Rate ($ USD)</label>
              <input type="number" placeholder="e.g., 1500" value={price} onChange={(e) => setPrice(e.target.value)} />
            </div>
            <div className="input-group">
              <label>Production Window / Duration</label>
              <input type="text" placeholder="e.g., 4 Hours Session" value={duration} onChange={(e) => setDuration(e.target.value)} />
            </div>
            <div className="input-group">
              <label>Included Deliverables & Services</label>
              <textarea rows={3} placeholder="e.g., Raw files delivery, color grading, 2 operators" value={services} onChange={(e) => setServices(e.target.value)} />
            </div>
            <button type="submit" className="action-btn-primary">Publish Package</button>
          </form>
        </div>

        <div className="catalog-display-panel">
          <h3>Active Catalog Offerings</h3>
          {error && <p className="error-alert">{error}</p>}
          <div className="catalog-grid">
            {packages.length === 0 ? (
              <p style={{ color: "#7f8c8d" }}>No packages configured in the database.</p>
            ) : (
              packages.map((pkg) => (
                <div key={pkg.id} className="catalog-card">
                  <div className="catalog-card-header">
                    <h4>{pkg.name}</h4>
                    <span className="price-tag">${pkg.price}</span>
                  </div>
                  <div className="catalog-card-body">
                    <p className="duration-pill">⏱️ {pkg.duration}</p>
                    <p className="services-list-text">{pkg.services}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PackageListing;