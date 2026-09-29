import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Core Pages
import AuthPage from './pages/AuthPage';
import ExplorePage from './pages/ExplorePage';
import BookingPage from './pages/BookingPage';
import PaymentPage from './pages/PaymentPage';
import AccountPage from './pages/AccountPage';
import AdminPage from './pages/AdminPage';
import LookupPage from './pages/LookupPage';
import DoctorDashboardPage from './pages/DoctorDashboardPage';

import { STORAGE_KEYS, getStorage, initInitialStorage } from './utils/storage';

/**
 * Scroll to top on route navigation
 */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
}

/**
 * Root Redirect Handler: Admin to /admin, Doctor to /doctor, others directly to /explore
 */
function RootRedirect() {
  const currentUser = getStorage(STORAGE_KEYS.CURRENT_USER, null);
  if (currentUser && currentUser.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }
  if (currentUser && currentUser.role === 'doctor') {
    return <Navigate to="/doctor" replace />;
  }
  return <Navigate to="/explore" replace />;
}

/**
 * Protected Route wrapper for authenticated users, preserving target location
 */
function RequireAuth({ children }) {
  const location = useLocation();
  const currentUser = getStorage(STORAGE_KEYS.CURRENT_USER, null);
  if (!currentUser) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }
  return children;
}

/**
 * Protected Route wrapper for Admin users only
 */
function RequireAdmin({ children }) {
  const currentUser = getStorage(STORAGE_KEYS.CURRENT_USER, null);
  if (!currentUser || currentUser.role !== 'admin') {
    return <Navigate to="/explore" replace />;
  }
  return children;
}

/**
 * Protected Route wrapper for Doctor users only
 */
function RequireDoctor({ children }) {
  const currentUser = getStorage(STORAGE_KEYS.CURRENT_USER, null);
  if (!currentUser || currentUser.role !== 'doctor') {
    return <Navigate to="/explore" replace />;
  }
  return children;
}

export default function App() {
  useEffect(() => {
    // Initialize seed data if not present in localStorage
    initInitialStorage();
  }, []);

  return (
    <HashRouter>
      <ScrollToTop />
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans selection:bg-sky-100 selection:text-sky-900">
        {/* Global Navigation Bar */}
        <Navbar />

        {/* Main Application Routes */}
        <div className="flex-1">
          <Routes>
            {/* Default Route */}
            <Route path="/" element={<RootRedirect />} />

            {/* 1. Explore Doctors & Hospitals (Public Landing) */}
            <Route path="/explore" element={<ExplorePage />} />

            {/* 2. Public Appointment Lookup by Phone */}
            <Route path="/lookup" element={<LookupPage />} />

            {/* 3. Auth Page (Login / Register) */}
            <Route path="/auth" element={<AuthPage />} />

            {/* 4. Booking Page */}
            <Route
              path="/booking/:type/:id"
              element={
                <RequireAuth>
                  <BookingPage />
                </RequireAuth>
              }
            />

            {/* 5. Payment Page */}
            <Route
              path="/payment"
              element={
                <RequireAuth>
                  <PaymentPage />
                </RequireAuth>
              }
            />

            {/* 6. Account Page (User Profile & Bookings) */}
            <Route
              path="/account"
              element={
                <RequireAuth>
                  <AccountPage />
                </RequireAuth>
              }
            />

            {/* 7. Admin Dashboard */}
            <Route
              path="/admin"
              element={
                <RequireAdmin>
                  <AdminPage />
                </RequireAdmin>
              }
            />

            {/* 8. Doctor Dashboard */}
            <Route
              path="/doctor"
              element={
                <RequireDoctor>
                  <DoctorDashboardPage />
                </RequireDoctor>
              }
            />

            {/* Fallback to root */}
            <Route path="*" element={<RootRedirect />} />
          </Routes>
        </div>

        {/* Global Footer */}
        <Footer />
      </div>
    </HashRouter>
  );
}
