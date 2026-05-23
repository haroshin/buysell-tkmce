import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import EventCalendar from '../components/features/EventCalendar';
import SEO from '../components/common/SEO';

const CalendarPage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      navigate('/', { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading || !user || user.role !== 'admin') {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="page-container py-6 lg:py-10 flex-1 flex flex-col">
      <SEO 
        title="Admin Events Calendar | Buy&Sell TKMCE" 
        description="Configure campus fests, academic dates, exam timetables, and college events." 
      />

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-dark-50 tracking-tight">Admin Events Console</h2>
        <p className="text-sm text-dark-300">Submit and manage official college events displayed on the home page.</p>
      </div>

      <div className="glass-card p-6 border border-dark-700/50">
        <EventCalendar />
      </div>
    </div>
  );
};

export default CalendarPage;
