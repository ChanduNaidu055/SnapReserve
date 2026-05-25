import React, { useState, useEffect, useCallback } from "react"; 
import axios from "axios";
import "./index.css"; 

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:4000";
//const API_URL = "http://localhost:4000";

const StudioManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [photographers, setPhotographers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState("");
  const [photoFilter, setPhotoFilter] = useState("");
  const [searchName, setSearchName] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;

  const fetchStudioData = useCallback(async () => {
    setLoading(true);
    try {
      const offset = (page - 1) * limit;
      
      let queryUrl = `${API_URL}/api/bookings?limit=${limit}&offset=${offset}`;
      if (statusFilter) queryUrl += `&status=${statusFilter}`;
      if (photoFilter) queryUrl += `&photographer_id=${photoFilter}`;
      if (searchName) queryUrl += `&customer_name=${searchName}`;

      const [bookingsRes, photographersRes] = await Promise.all([
        axios.get(queryUrl),
        axios.get(`${API_URL}/api/photographers`)
      ]);
      
      setBookings(bookingsRes.data || []);
      setPhotographers(photographersRes.data || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching studio data:", error);
      setLoading(false);
    }
  }, [page, statusFilter, photoFilter, searchName, limit]);
  
  useEffect(() => {
    fetchStudioData();
  }, [fetchStudioData]); 

  const getPhotographerName = (id) => {
    const photographer = photographers.find(p => p.id === id);
    return photographer ? photographer.name : "Unassigned";
  };

  const updateStatus = async (id, newStatus) => {
    try {
      await axios.put(`${API_URL}/api/bookings/${id}/status`, { status: newStatus });
      fetchStudioData(); 
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  return (
    <div className="management-workspace">
      <div className="management-heading-zone">
        <h1>Studio Operations & Management</h1>
        <p>Monitor and manage all upcoming client sessions and creative assignments.</p>
      </div>

      <div className="filter-controls" style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <input 
          type="text" 
          placeholder="Search by Client Name..." 
          value={searchName} 
          onChange={(e) => { setSearchName(e.target.value); setPage(1); }}
          style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #dcdde1' }}
        />
        <select 
          value={statusFilter} 
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #dcdde1' }}
        >
          <option value="">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Confirmed">Confirmed</option>
          <option value="Ongoing">Ongoing</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
        <select 
          value={photoFilter} 
          onChange={(e) => { setPhotoFilter(e.target.value); setPage(1); }}
          style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #dcdde1' }}
        >
          <option value="">All Photographers</option>
          {photographers.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      <div className="table-responsive-wrapper">
        {loading ? (
          <div className="center-loader-spinner">Loading records...</div>
        ) : (
          <table className="premium-data-table">
            <thead>
              <tr>
                <th>Order Code</th>
                <th>Client Profile</th>
                <th>Photographer</th>
                <th>Production Date</th>
                <th>Event Category</th>
                <th>Status State</th>
                <th>Operational Action</th>
              </tr>
            </thead>
            <tbody>
              {bookings.length === 0 ? (
                <tr><td colSpan="7" className="empty-table-prompt">No bookings match your criteria.</td></tr>
              ) : (
                bookings.map((booking) => (
                  <tr key={booking.id}>
                    <td className="client-bold-title">#{booking.id}</td>
                    <td>{booking.customer_name}</td>
                    <td className="photographer-name-text">📸 {getPhotographerName(booking.photographer_id)}</td>
                    <td>{new Date(booking.date).toLocaleDateString()}</td>
                    <td><span className="event-tag-bubble">{booking.event_type}</span></td>
                    <td>{booking.status}</td>
                    <td>
                      <select 
                        className="table-row-picker"
                        value={booking.status}
                        onChange={(e) => updateStatus(booking.id, e.target.value)}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Ongoing">Ongoing</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      <div className="pagination-controls" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
        <button 
          onClick={() => setPage(prev => Math.max(prev - 1, 1))} 
          disabled={page === 1}
          style={{ padding: '8px 16px', cursor: page === 1 ? 'not-allowed' : 'pointer', borderRadius: '6px', border: '1px solid #dcdde1' }}
        >
          Previous Page
        </button>
        <span style={{ padding: '8px', fontWeight: '600' }}>Page {page}</span>
        <button 
          onClick={() => setPage(prev => prev + 1)}
          disabled={bookings.length < limit}
          style={{ padding: '8px 16px', cursor: bookings.length < limit ? 'not-allowed' : 'pointer', borderRadius: '6px', border: '1px solid #dcdde1' }}
        >
          Next Page
        </button>
      </div>
    </div>
  );
};

export default StudioManagement;