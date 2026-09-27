import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// 6 Core Pages
import AuthPage from './pages/AuthPage';
import ExplorePage from './pages/ExplorePage';
import BookingPage from './pages/BookingPage';
import PaymentPage from './pages/PaymentPage';
import AccountPage from './pages/AccountPage';
import AdminPage from './pages/AdminPage';

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
 * Root Redirect Handler based on auth state
 */
function RootRedirect() {
  const currentUser = getStorage(STORAGE_KEYS.CURRENT_USER, null);
  if (!currentUser) {
    return <Navigate to="/auth" replace />;
  }
  if (currentUser.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }
  return <Navigate to="/explore" replace />;
}

/**
 * Protected Route wrapper for authenticated users
 */
function RequireAuth({ children }) {
  const currentUser = getStorage(STORAGE_KEYS.CURRENT_USER, null);
  if (!currentUser) {
    return <Navigate to="/auth" replace />;
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

export default function App() {
  useEffect(() => {
    // Initialize seed data if not present in localStorage
    initInitialStorage();
  }, []);

  return (
    <BrowserRouter>
      <ScrollToTop />
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans selection:bg-sky-100 selection:text-sky-900">
        {/* Global Navigation Bar */}
        <Navbar />

        {/* Main Application Routes */}
        <div className="flex-1">
          <Routes>
            {/* Default Route */}
            <Route path="/" element={<RootRedirect />} />

            {/* 1. Auth Page */}
            <Route path="/auth" element={<AuthPage />} />

            {/* 2. Explore Doctors & Hospitals */}
            <Route path="/explore" element={<ExplorePage />} />

            {/* 3. Booking Page */}
            <Route
              path="/booking/:type/:id"
              element={
                <RequireAuth>
                  <BookingPage />
                </RequireAuth>
              }
            />

            {/* 4. Payment Page */}
            <Route
              path="/payment"
              element={
                <RequireAuth>
                  <PaymentPage />
                </RequireAuth>
              }
            />

            {/* 5. Account Page */}
            <Route
              path="/account"
              element={
                <RequireAuth>
                  <AccountPage />
                </RequireAuth>
              }
            />

            {/* 6. Admin Page */}
            <Route
              path="/admin"
              element={
                <RequireAdmin>
                  <AdminPage />
                </RequireAdmin>
              }
            />

            {/* Fallback to root */}
            <Route path="*" element={<RootRedirect />} />
          </Routes>
        </div>

        {/* Global Footer */}
        <Footer />
      </div>
    </BrowserRouter>
  );
}
