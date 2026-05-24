import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNotification } from "../../Context/NotificationContext"; 
import "./index.css";

const API_URL = process.env.REACT_APP_API_URL || "https://snapreserve-production.up.railway.app";

const BookingReservation = () => {
  const { addNotification } = useNotification(); 

  const [customerName, setCustomerName] = useState("");
  const [packageId, setPackageId] = useState("");
  const [photographerId, setPhotographerId] = useState("");
  const [date, setDate] = useState("");
  const [eventType, setEventType] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");
  const [message, setMessage] = useState(null);
  const [isSuccess, setIsSuccess] = useState(true);

  const [packagesList, setPackagesList] = useState([]);
  const [photographersList, setPhotographersList] = useState([]);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const packagesResponse = await axios.get(`${API_URL}/api/packages`);
        setPackagesList(packagesResponse.data || []);
      } catch (err) {
        console.error("Failed to fetch packages.", err);
      }
    };
    fetchPackages();
  }, []);

  useEffect(() => {
    const fetchAvailablePhotographers = async () => {
      if (!date) {
        setPhotographersList([]);
        return;
      }
      try {
        const response = await axios.get(`${API_URL}/api/photographers/availability?date=${date}`);
        setPhotographersList(response.data || []);
      } catch (err) {
        console.error("Failed to fetch available photographers.", err);
      }
    };
    fetchAvailablePhotographers();
  }, [date]);

  const handleBooking = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (!customerName || !packageId || !photographerId || !date || !eventType) {
      setMessage("All structural validation fields are required.");
      setIsSuccess(false);
      return;
    }

    try {
      await axios.post(`${API_URL}/api/bookings`, {
        customer_name: customerName,
        package_id: parseInt(packageId),
        photographer_id: parseInt(photographerId),
        date,
        event_type: eventType,
        special_requests: specialRequests
      });
      
      const selectedPkg = packagesList.find(p => p.id === parseInt(packageId));
      const packageName = selectedPkg ? selectedPkg.name : "Package";

      addNotification(`🎉 New booking confirmed! ${customerName} selected the ${packageName}.`);

      setMessage("Session secured successfully! Proceeding to validation logs.");
      setIsSuccess(true);
      
      setCustomerName(""); 
      setPackageId(""); 
      setPhotographerId(""); 
      setDate(""); 
      setEventType(""); 
      setSpecialRequests("");

    } catch (err) {
      setIsSuccess(false);
      if (err.response && err.response.status === 400) {
        setMessage(err.response.data);
      } else {
        setMessage("Overlapping photographer schedule validation conflict detected.");
      }
    }
  };

  return (
    <div className="booking-workspace">
      <div className="booking-card-deck">
        <div className="deck-info-lane">
          <h1 className="secure-session-heading">Secure Your Session</h1>
          <p className="secure-session-para">
            Submit client operational requirements here. Our schedule guard system intercepts overlapping requests automatically to protect creative timelines.
          </p>
          <div className="guideline-badge">🔒 Encrypted Database Protection</div>
        </div>

        <form onSubmit={handleBooking} className="booking-split-form">
          <div className="form-row-twin">
            <div className="field-block">
              <label>Client Full Name</label>
              <input type="text" placeholder="Johnathan Smith" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
            </div>
            <div className="field-block">
              <label>Target Shoot Date</label>
              <input type="date" value={date} onChange={(e) => {
                setDate(e.target.value);
                setPhotographerId("");
              }} />
            </div>
          </div>

          <div className="form-row-twin">
            <div className="field-block">
              <label>Select Photography Package</label>
              <select value={packageId} onChange={(e) => setPackageId(e.target.value)}>
                <option value="">-- Select a Package --</option>
                {packagesList.map((pkg) => (
                  <option key={pkg.id} value={pkg.id}>
                    {pkg.name || pkg.title} {pkg.price ? `($${pkg.price})` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="field-block">
              <label>Preferred Photographer</label>
              <select 
                value={photographerId} 
                onChange={(e) => setPhotographerId(e.target.value)}
                disabled={!date}
              >
                <option value="">
                  {!date ? "-- Select a Date First --" : "-- Select a Photographer --"}
                </option>
                {photographersList.map((photo) => (
                  <option key={photo.id} value={photo.id}>
                    {photo.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="field-block">
            <label>Event Classification Type</label>
            <input type="text" placeholder="e.g., Outdoor Pre-Wedding Session" value={eventType} onChange={(e) => setEventType(e.target.value)} />
          </div>

          <div className="field-block">
            <label>Special Production Requests (Optional)</label>
            <textarea rows={3} placeholder="Specify backdrop variations, location instructions, or lighting requests..." value={specialRequests} onChange={(e) => setSpecialRequests(e.target.value)} />
          </div>

          <button type="submit" className="submit-booking-btn">Finalize Reservation Request</button>
          
          {message && (
            <div className={`notification-banner ${isSuccess ? "banner-success" : "banner-error"}`}>
              {isSuccess ? "✅" : "⚠️"} {message}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default BookingReservation;