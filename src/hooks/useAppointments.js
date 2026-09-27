import { useState, useEffect, useCallback } from 'react';
import appointmentService from '../services/appointmentService';

export const useAppointments = (initialFilters = {}) => {
  const [appointments, setAppointments] = useState([]);
  const [filters, setFilters] = useState(initialFilters);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
    estimatedRevenue: 0
  });

  const refresh = useCallback(() => {
    setLoading(true);
    try {
      const data = appointmentService.getAll(filters);
      setAppointments(data);
      setStats(appointmentService.getStats());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    refresh();

    const handleStorageChange = () => {
      refresh();
    };

    window.addEventListener('medibook_storage_change', handleStorageChange);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('medibook_storage_change', handleStorageChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [refresh]);

  const createAppointment = useCallback((data) => {
    const created = appointmentService.create(data);
    refresh();
    return created;
  }, [refresh]);

  const updateStatus = useCallback((id, status, reason) => {
    const updated = appointmentService.updateStatus(id, status, reason);
    refresh();
    return updated;
  }, [refresh]);

  const deleteAppointment = useCallback((id) => {
    const success = appointmentService.delete(id);
    refresh();
    return success;
  }, [refresh]);

  const resetData = useCallback(() => {
    const success = appointmentService.resetToMockData();
    refresh();
    return success;
  }, [refresh]);

  return {
    appointments,
    stats,
    loading,
    filters,
    setFilters,
    refresh,
    createAppointment,
    updateStatus,
    deleteAppointment,
    resetData,
    doctors: appointmentService.getDoctors(),
    getOccupiedSlots: appointmentService.getOccupiedSlots.bind(appointmentService),
    getByPhone: appointmentService.getByPhone.bind(appointmentService)
  };
};
