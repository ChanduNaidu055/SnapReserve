import React, { useState, useEffect, useRef } from "react";
import { useNotification } from "../../Context/NotificationContext";
import "./index.css";

const NotificationCenter = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  const { notifications, markAllAsRead } = useNotification(); 

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="notification-container" ref={dropdownRef}>
      
      <div className="bell-icon-wrapper" onClick={toggleDropdown}>
        <span className="bell-emoji">🔔</span>
        {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
      </div>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="dropdown-header">
            <h4>Notifications</h4>
            {unreadCount > 0 && (
              <button className="mark-read-btn" onClick={markAllAsRead}>
                Mark all read
              </button>
            )}
          </div>
          
          <div className="notification-list">
            {notifications.length === 0 ? (
              <p className="empty-notif">No new notifications</p>
            ) : (
              notifications.map(notif => (
                <div key={notif.id} className={`notif-item ${notif.read ? 'read' : 'unread'}`}>
                  <p>{notif.text}</p>
                  <span className="notif-time">{notif.time}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;