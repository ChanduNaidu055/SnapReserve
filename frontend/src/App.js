import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Navbar from "./Components/Navbar";
import PackageListing from "./Components/PackageListing";
import BookingReservation from "./Components/BookingReservation";
import PhotographerSchedule from "./Components/PhotographerSchedule";
import CustomerConfirmation from "./Components/CustomerConfirmation";
import StudioManagement from "./Components/StudioManagement";
import Dashboard from "./Components/Dashboard";
import PhotoGallery from "./Components/PhotoGallery";
import RevenueAnalytics from "./Components/RevenueAnalytics";

import { NotificationProvider } from './Context/NotificationContext';

import ProtectedRoute from "./Components/ProtectedRoute";

const App = () => {
  return (
  <NotificationProvider>
    <Router>
      <div>
        <Navbar />
        <div style={{ padding: "30px" }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/packages" element={<PackageListing />} />
            <Route path="/gallery" element={<PhotoGallery />} />
            <Route path="/book" element={<BookingReservation />} />
            <Route path="/schedule" element={<PhotographerSchedule />} />
            <Route path="/confirmation" element={<CustomerConfirmation />} />
            <Route path="/analytics" element={<RevenueAnalytics />} />
            <Route 
              path="/manage" 
              element={
                <ProtectedRoute isAdmin={true}>
                  <StudioManagement />
                </ProtectedRoute>
              } 
            />
            
          </Routes>
        </div>
      </div>
    </Router>
  </NotificationProvider>
  );
};

export default App;