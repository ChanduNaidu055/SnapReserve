import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || "https://snapreserve-production.up.railway.app";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchBackendReminders = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/bookings/reminders`);
        if (response.data && response.data.length > 0) {
          const backendNotifs = response.data.map(notif => ({
            id: `backend-${notif.id}-${Date.now()}`,
            text: notif.message,
            time: "System Alert",
            read: false,
            type: notif.type
          }));
          setNotifications(prev => [...backendNotifs, ...prev]);
        }
      } catch (error) {
        console.error("Failed to fetch backend reminders:", error);
      }
    };
    
    fetchBackendReminders();
  }, []);

  const addNotification = (message) => {
    const newNotif = {
      id: Date.now(),
      text: message,
      time: "Just now",
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, markAllAsRead }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  return useContext(NotificationContext);
};