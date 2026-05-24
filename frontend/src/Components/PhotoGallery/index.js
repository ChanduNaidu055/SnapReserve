import React, { useState, useEffect } from "react";
import axios from "axios";
import "./index.css";

const PhotoGallery = () => {
  const [portfolioData, setPortfolioData] = useState([]);
  const [filter, setFilter] = useState("All");
  const [lightboxImg, setLightboxImg] = useState(null);
  const [loading, setLoading] = useState(true);

  const categories = ["All", "Wedding", "Portrait", "Commercial"];

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const response = await axios.get("/api/gallery");
        setPortfolioData(Array.isArray(response.data) ? response.data : []);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch gallery records", err);
        setLoading(false);
      }
    };
    fetchGallery();
  }, []);

  const safeData = Array.isArray(portfolioData) ? portfolioData : [];
  const filteredPhotos = filter === "All" 
    ? safeData 
    : safeData.filter(img => img && img.category === filter);

  if (loading) return <div style={{ color: "#00bcd4", padding: "40px" }}>Loading studio portfolio assets...</div>;

  return (
    <div className="gallery-workspace animate-fade-in">
      <div className="gallery-header-deck">
        <h1>Studio Portfolio</h1>
        <p>Browse our latest client galleries and production shoots.</p>
      </div>

      <div className="filter-deck">
        {categories.map(cat => (
          <button 
            key={cat} 
            className={`filter-btn ${filter === cat ? "active" : ""}`}
            onClick={() => setFilter(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="photo-grid">
        {filteredPhotos.length === 0 ? (
          <p style={{ color: "#aaa" }}>No images found in the gallery table.</p>
        ) : (
          filteredPhotos.map((photo) => (
            <div key={photo.id} className="photo-card" onClick={() => setLightboxImg(photo.src)}>
              <img src={photo.src} alt={photo.title || "Gallery Image"} loading="lazy" />
              <div className="photo-overlay">
                <h4>{photo.title}</h4>
                <span>{photo.category}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {lightboxImg && (
        <div className="lightbox-modal" onClick={() => setLightboxImg(null)}>
          <span className="close-btn">&times;</span>
          <img src={lightboxImg} alt="Fullscreen preview" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
};

export default PhotoGallery;