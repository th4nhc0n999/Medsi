import React, { useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import DoctorListPage from './pages/DoctorListPage';
import BookingModalOrPage from './pages/BookingModalOrPage';
import PatientHistoryPage from './pages/PatientHistoryPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import { useAppointments } from './hooks/useAppointments';
import { ToastProvider } from './hooks/useToast';

function AppContent() {
  const [currentTab, setCurrentTab] = useState('home');

  // Navigation params transferred across pages
  const [navParams, setNavParams] = useState({
    search: '',
    specialty: '',
    doctor: null,
    phone: '',
  });

  const {
    appointments,
    stats,
    doctors,
    createAppointment,
    updateStatus,
    deleteAppointment,
    resetData,
    getByPhone,
  } = useAppointments();

  const handleNavigate = (tabId, params = {}) => {
    setCurrentTab(tabId);
    setNavParams((prev) => ({ ...prev, ...params }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectDoctorForBooking = (doctor) => {
    setNavParams((prev) => ({ ...prev, doctor }));
    setCurrentTab('booking');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      {/* Header with real-time pending appointment counter */}
      <Header
        currentTab={currentTab}
        onNavigate={handleNavigate}
        pendingCount={stats.pending}
      />

      {/* Main Page Content */}
      <main className="flex-1">
        {currentTab === 'home' && (
          <HomePage
            onNavigate={handleNavigate}
            onSelectDoctor={handleSelectDoctorForBooking}
            doctors={doctors}
          />
        )}

        {currentTab === 'doctors' && (
          <DoctorListPage
            doctors={doctors}
            onSelectDoctor={handleSelectDoctorForBooking}
            initialSpecialty={navParams.specialty}
            initialSearch={navParams.search}
          />
        )}

        {currentTab === 'booking' && (
          <BookingModalOrPage
            doctors={doctors}
            selectedDoctorInitial={navParams.doctor}
            onBookingSuccess={createAppointment}
            onNavigate={handleNavigate}
          />
        )}

        {currentTab === 'history' && (
          <PatientHistoryPage
            initialPhone={navParams.phone}
            onNavigate={handleNavigate}
            getByPhone={getByPhone}
            onCancelAppointment={(id, reason) => updateStatus(id, 'cancelled', reason)}
          />
        )}

        {currentTab === 'admin' && (
          <AdminDashboardPage
            appointments={appointments}
            stats={stats}
            doctors={doctors}
            onUpdateStatus={updateStatus}
            onDeleteAppointment={deleteAppointment}
            onResetData={resetData}
            onNavigate={handleNavigate}
          />
        )}
      </main>

      {/* Footer */}
      <Footer onNavigate={handleNavigate} />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}
