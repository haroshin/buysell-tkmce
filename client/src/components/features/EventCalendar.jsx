import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiCalendar, FiClock, FiMapPin, FiUser, FiCheck, FiX, 
  FiPlus, FiChevronLeft, FiChevronRight, FiInfo, FiTag, 
  FiUsers, FiAlertCircle, FiInbox, FiShield, FiTrash2
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const categories = [
  'Academic',
  'Technical Fest',
  'Cultural Fest',
  'Workshop/Seminar',
  'Sports',
  'Club Meeting',
  'Exam/Test',
  'Other'
];

const categoryStyles = {
  'Academic': {
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    dot: 'bg-blue-500',
    badge: 'bg-blue-500/15 text-blue-400 border border-blue-500/20'
  },
  'Technical Fest': {
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    dot: 'bg-emerald-500',
    badge: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
  },
  'Cultural Fest': {
    color: 'text-pink-400',
    bg: 'bg-pink-500/10',
    border: 'border-pink-500/20',
    dot: 'bg-pink-500',
    badge: 'bg-pink-500/15 text-pink-400 border border-pink-500/20'
  },
  'Workshop/Seminar': {
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20',
    dot: 'bg-purple-500',
    badge: 'bg-purple-500/15 text-purple-400 border border-purple-500/20'
  },
  'Sports': {
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/20',
    dot: 'bg-orange-500',
    badge: 'bg-orange-500/15 text-orange-400 border border-orange-500/20'
  },
  'Club Meeting': {
    color: 'text-teal-400',
    bg: 'bg-teal-500/10',
    border: 'border-teal-500/20',
    dot: 'bg-teal-500',
    badge: 'bg-teal-500/15 text-teal-400 border border-teal-500/20'
  },
  'Exam/Test': {
    color: 'text-rose-400',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/20',
    dot: 'bg-rose-500',
    badge: 'bg-rose-500/15 text-rose-400 border border-rose-500/20'
  },
  'Other': {
    color: 'text-slate-400',
    bg: 'bg-slate-500/10',
    border: 'border-slate-500/20',
    dot: 'bg-slate-500',
    badge: 'bg-slate-500/15 text-slate-400 border border-slate-500/20'
  }
};

const EventCalendar = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  // Date states
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Event states
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Submission Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    endDate: '',
    startTime: '',
    endTime: '',
    location: '',
    organizer: '',
    category: 'Academic'
  });

  // Expanded event details card
  const [expandedEventId, setExpandedEventId] = useState(null);

  // Check if two dates represent the same day
  const isSameDay = (d1, d2) => {
    if (!d1 || !d2) return false;
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  };

  // Fetch verified events for current month
  const fetchEvents = async () => {
    setLoading(true);
    try {
      const month = currentDate.getMonth() + 1;
      const year = currentDate.getFullYear();
      const { data } = await api.get(`/events?month=${month}&year=${year}`);
      if (data.success) {
        setEvents(data.events);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [currentDate]);

  // Navigate calendar month
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  // Compute 42 grid cells
  const gridDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const prevTotalDays = new Date(year, month, 0).getDate();

    const days = [];

    // Previous month filler days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = prevTotalDays - i;
      const date = new Date(year, month - 1, dayNum);
      days.push({
        date,
        dayNumber: dayNum,
        isCurrentMonth: false,
        isToday: isSameDay(date, new Date())
      });
    }

    // Current month days
    for (let i = 1; i <= totalDays; i++) {
      const date = new Date(year, month, i);
      days.push({
        date,
        dayNumber: i,
        isCurrentMonth: true,
        isToday: isSameDay(date, new Date())
      });
    }

    // Next month filler days to complete grid
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      const date = new Date(year, month + 1, i);
      days.push({
        date,
        dayNumber: i,
        isCurrentMonth: false,
        isToday: isSameDay(date, new Date())
      });
    }

    return days;
  }, [currentDate]);

  // Get events targeting a specific day (inclusive date ranges)
  const getEventsForDate = (dateVal) => {
    return events.filter(event => {
      const start = new Date(event.date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(event.endDate || event.date);
      end.setHours(23, 59, 59, 999);
      
      const target = new Date(dateVal);
      target.setHours(12, 0, 0, 0);

      return target >= start && target <= end;
    });
  };

  // Memoized lists of events for currently selected date
  const selectedDateEvents = useMemo(() => {
    return getEventsForDate(selectedDate);
  }, [selectedDate, events]);

  // Form submission handler (Admin only)
  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!isAdmin) {
      toast.error('Only administrators can add events.');
      return;
    }

    if (formData.endDate && new Date(formData.endDate) < new Date(formData.date)) {
      toast.error('End Date cannot be earlier than the Start Date');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        endDate: formData.endDate || formData.date
      };

      const { data } = await api.post('/events', payload);
      if (data.success) {
        toast.success(data.message || 'Event added successfully!');
        setIsModalOpen(false);
        setFormData({
          title: '',
          description: '',
          date: '',
          endDate: '',
          startTime: '',
          endTime: '',
          location: '',
          organizer: '',
          category: 'Academic'
        });
        fetchEvents();
      }
    } catch (error) {
      console.error('Error submitting event:', error);
      const msg = error.response?.data?.message || 'Failed to submit event';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Delete event (Admin only)
  const handleDeleteEvent = async (id) => {
    if (!isAdmin) {
      toast.error('Only administrators can delete events.');
      return;
    }

    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        const { data } = await api.delete(`/events/${id}`);
        if (data.success) {
          toast.success('Event deleted successfully');
          fetchEvents();
        }
      } catch (error) {
        console.error('Error deleting event:', error);
        toast.error('Failed to delete event');
      }
    }
  };

  const handleDateClick = (dayDate) => {
    setSelectedDate(dayDate);
    if (dayDate.getMonth() !== currentDate.getMonth()) {
      setCurrentDate(new Date(dayDate.getFullYear(), dayDate.getMonth(), 1));
    }
    setExpandedEventId(null);
  };

  return (
    <div className="w-full flex flex-col">
      {/* Header bar controls inside component */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-bold text-dark-50">Campus Calendar Grid</h3>
          <p className="text-xs text-dark-400">Select dates to view schedules</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Admin submission button */}
          {isAdmin && (
            <button
              onClick={() => {
                const dateStr = selectedDate.toISOString().split('T')[0];
                setFormData(prev => ({ ...prev, date: dateStr, endDate: dateStr }));
                setIsModalOpen(true);
              }}
              className="flex items-center gap-2 btn-primary px-4 py-2 text-xs rounded-xl"
            >
              <FiPlus className="text-base" />
              <span>Add Event</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Calendar Grid Container */}
        <div className="lg:col-span-2 flex flex-col bg-dark-800/40 border border-dark-700/30 rounded-2xl p-5">
          
          {/* Month Toolbar */}
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-dark-700/20">
            <h4 className="text-base font-bold text-dark-100">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h4>
            <div className="flex items-center gap-1.5">
              <button 
                onClick={prevMonth}
                className="p-1.5 rounded-lg bg-dark-850 text-dark-200 border border-dark-700/50 hover:bg-dark-700 transition-colors"
              >
                <FiChevronLeft />
              </button>
              <button
                onClick={goToToday}
                className="px-2.5 py-1 text-[10px] font-semibold rounded-lg bg-dark-850 text-dark-100 border border-dark-700/50 hover:bg-dark-700 transition-colors"
              >
                Today
              </button>
              <button 
                onClick={nextMonth}
                className="p-1.5 rounded-lg bg-dark-850 text-dark-200 border border-dark-700/50 hover:bg-dark-700 transition-colors"
              >
                <FiChevronRight />
              </button>
            </div>
          </div>

          {/* Weekday Names */}
          <div className="grid grid-cols-7 gap-1 text-center font-medium text-[10px] text-dark-400 uppercase tracking-wider mb-1.5">
            {dayNames.map((name) => (
              <div key={name} className="py-1">{name}</div>
            ))}
          </div>

          {/* 42 grid cells */}
          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="w-8 h-8 border-3 border-primary-500/20 border-t-primary-500 rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-1 min-h-[320px]">
              {gridDays.map((day, idx) => {
                const dayEvents = getEventsForDate(day.date);
                const isSelected = isSameDay(day.date, selectedDate);
                const isToday = day.isToday;

                return (
                  <button
                    key={idx}
                    onClick={() => handleDateClick(day.date)}
                    className={`flex flex-col justify-between items-stretch p-1.5 min-h-[60px] sm:min-h-[70px] text-left rounded-xl transition-all duration-200 border group focus:outline-none ${
                      isSelected
                        ? 'bg-primary-500/10 border-primary-500/50'
                        : isToday
                        ? 'bg-accent-500/5 border-accent-500/30'
                        : day.isCurrentMonth
                        ? 'bg-dark-800/20 border-dark-700/10 hover:bg-dark-850/60 hover:border-dark-700/50'
                        : 'bg-dark-900/5 border-transparent opacity-30 hover:opacity-60'
                    }`}
                  >
                    <span className={`text-[10px] font-semibold ${
                      isToday 
                        ? 'w-4 h-4 rounded-full flex items-center justify-center bg-accent-500 text-dark-900 font-bold text-[9px]' 
                        : isSelected 
                        ? 'text-primary-400' 
                        : 'text-dark-200'
                    }`}>
                      {day.dayNumber}
                    </span>

                    {/* Indicators */}
                    <div className="mt-1 flex flex-col gap-0.5 overflow-hidden">
                      {dayEvents.slice(0, 1).map((ev) => {
                        const style = categoryStyles[ev.category] || categoryStyles['Other'];
                        return (
                          <div 
                            key={ev._id} 
                            className={`hidden sm:block text-[8px] px-1 py-0.5 rounded truncate font-medium border ${style.badge}`}
                          >
                            {ev.title}
                          </div>
                        );
                      })}
                      <div className="flex gap-0.5 items-center sm:mt-0 mt-1">
                        {dayEvents.map((ev) => {
                          const style = categoryStyles[ev.category] || categoryStyles['Other'];
                          return (
                            <span 
                              key={ev._id} 
                              className={`w-1.5 h-1.5 rounded-full ${style.dot} sm:hidden`}
                            />
                          );
                        })}
                        {dayEvents.length > 1 && (
                          <span className="text-[7px] text-dark-400 font-bold hidden sm:inline pl-0.5">
                            +{dayEvents.length - 1}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Categories guide */}
          <div className="mt-4 pt-3 border-t border-dark-700/20 flex flex-wrap gap-x-3 gap-y-1.5 text-[10px]">
            {categories.map((cat) => {
              const styles = categoryStyles[cat];
              return (
                <div key={cat} className="flex items-center gap-1">
                  <span className={`w-2 h-2 rounded-full ${styles.dot}`} />
                  <span className="text-dark-300">{cat}</span>
                </div>
              );
            })}
          </div>

        </div>

        {/* Right Info Panel (Event lists) */}
        <div className="bg-dark-800/40 border border-dark-700/30 rounded-2xl p-5 min-h-[320px] flex flex-col">
          <div className="mb-3 pb-2 border-b border-dark-700/20 flex justify-between items-center">
            <div>
              <h4 className="font-bold text-sm text-dark-50">
                {selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </h4>
              <p className="text-[10px] text-dark-400">
                {selectedDateEvents.length} {selectedDateEvents.length === 1 ? 'event' : 'events'} listed
              </p>
            </div>
            {isAdmin && (
              <button
                onClick={() => {
                  const dateStr = selectedDate.toISOString().split('T')[0];
                  setFormData(prev => ({ ...prev, date: dateStr, endDate: dateStr }));
                  setIsModalOpen(true);
                }}
                className="p-1 rounded-lg bg-primary-500/10 text-primary-400 hover:bg-primary-500/20 transition-all text-xs"
                title="Add Event"
              >
                <FiPlus />
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto space-y-2.5 max-h-[360px] pr-0.5">
            {selectedDateEvents.length === 0 ? (
              <div className="h-full py-10 flex flex-col items-center justify-center text-center">
                <div className="w-10 h-10 rounded-full bg-dark-800/50 border border-dark-700/35 flex items-center justify-center text-dark-400 mb-2">
                  <FiInbox className="text-lg" />
                </div>
                <h5 className="text-xs font-semibold text-dark-200">No events listed</h5>
                <p className="text-[10px] text-dark-400 max-w-[160px] mt-0.5">
                  No activities listed for this day.
                </p>
              </div>
            ) : (
              selectedDateEvents.map((event) => {
                const style = categoryStyles[event.category] || categoryStyles['Other'];
                const isExpanded = expandedEventId === event._id;

                return (
                  <div
                    key={event._id}
                    className="p-3 bg-dark-800/50 border border-dark-700/20 hover:border-dark-700/50 rounded-xl transition-all cursor-pointer"
                    onClick={() => setExpandedEventId(isExpanded ? null : event._id)}
                  >
                    <div className="flex items-start justify-between gap-1.5">
                      <div>
                        <span className={`inline-block text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full border ${style.badge} mb-1.5`}>
                          {event.category}
                        </span>
                        <h5 className="font-semibold text-xs text-dark-100">
                          {event.title}
                        </h5>
                      </div>
                    </div>

                    <div className="mt-2.5 flex flex-col gap-1 text-[10px] text-dark-300">
                      <div className="flex items-center gap-1">
                        <FiClock className="text-dark-400" />
                        <span>{event.startTime} - {event.endTime}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FiMapPin className="text-dark-400" />
                        <span className="truncate">{event.location}</span>
                      </div>
                    </div>

                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-2 pt-2 border-t border-dark-700/20 text-[11px] space-y-2">
                            <p className="text-dark-200 leading-normal font-light whitespace-pre-line">
                              {event.description}
                            </p>
                            
                            <div className="p-1.5 bg-dark-900/30 border border-dark-700/10 rounded-lg text-[10px] text-dark-300 space-y-1">
                              <div>Organizer: <strong className="text-dark-100">{event.organizer}</strong></div>
                              <div>Posted by: <span className="text-dark-100">{event.createdBy?.name || 'Administrator'}</span></div>
                            </div>

                            {/* Admin-only deletion */}
                            {user && user.role === 'admin' && (
                              <div className="pt-1.5 flex justify-end">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteEvent(event._id);
                                  }}
                                  className="text-[9px] px-2 py-1 text-red-400 hover:bg-red-500/10 border border-red-500/20 rounded-lg transition-colors flex items-center gap-1"
                                >
                                  <FiTrash2 /> Delete
                                </button>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

      {/* Submission Modal Form Overlay (Admin only) */}
      <AnimatePresence>
        {isModalOpen && isAdmin && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-dark-950/80 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              className="relative w-full max-w-md bg-dark-800 border border-dark-700/80 rounded-2xl shadow-2xl p-5 overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="flex items-center justify-between pb-3 border-b border-dark-700/50 mb-3 shrink-0">
                <div className="flex items-center gap-2">
                  <FiCalendar className="text-primary-400 text-lg" />
                  <h4 className="text-base font-bold text-dark-50">Create Campus Event</h4>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-1 text-dark-300 hover:text-white rounded-lg">
                  <FiX className="text-lg" />
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto space-y-3.5 pr-0.5">
                
                {/* Auto-verify alert */}
                <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-start gap-2 text-[11px] text-emerald-400">
                  <FiCheck className="text-emerald-500 text-sm shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block">Official Event Posting</span>
                    As an administrator, this event will post instantly onto the public campus homepage.
                  </div>
                </div>

                <div className="space-y-0.5">
                  <label className="text-[10px] font-semibold text-dark-200">Event Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="e.g. End Semester Exams"
                    className="w-full bg-dark-900 border border-dark-700 rounded-lg px-3 py-2 text-xs text-dark-50 focus:outline-none focus:border-primary-500/50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-0.5">
                    <label className="text-[10px] font-semibold text-dark-200">Category *</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full bg-dark-900 border border-dark-700 rounded-lg px-3 py-2 text-xs text-dark-50 focus:outline-none focus:border-primary-500/50"
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-0.5">
                    <label className="text-[10px] font-semibold text-dark-200">Organizer *</label>
                    <input
                      type="text"
                      required
                      value={formData.organizer}
                      onChange={(e) => setFormData({...formData, organizer: e.target.value})}
                      placeholder="e.g. College Office / CSE SB"
                      className="w-full bg-dark-900 border border-dark-700 rounded-lg px-3 py-2 text-xs text-dark-50 focus:outline-none focus:border-primary-500/50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-0.5">
                    <label className="text-[10px] font-semibold text-dark-200">Start Date *</label>
                    <input
                      type="date"
                      required
                      value={formData.date}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData(prev => ({ 
                          ...prev, 
                          date: val, 
                          endDate: prev.endDate && prev.endDate < val ? val : prev.endDate || val 
                        }));
                      }}
                      className="w-full bg-dark-900 border border-dark-700 rounded-lg px-3 py-2 text-xs text-dark-50 focus:outline-none focus:border-primary-500/50"
                    />
                  </div>
                  <div className="space-y-0.5">
                    <label className="text-[10px] font-semibold text-dark-200">End Date</label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                      min={formData.date}
                      className="w-full bg-dark-900 border border-dark-700 rounded-lg px-3 py-2 text-xs text-dark-50 focus:outline-none focus:border-primary-500/50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-0.5">
                    <label className="text-[10px] font-semibold text-dark-200">Start Time *</label>
                    <input
                      type="time"
                      required
                      value={formData.startTime}
                      onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                      className="w-full bg-dark-900 border border-dark-700 rounded-lg px-3 py-2 text-xs text-dark-50 focus:outline-none focus:border-primary-500/50"
                    />
                  </div>
                  <div className="space-y-0.5">
                    <label className="text-[10px] font-semibold text-dark-200">End Time *</label>
                    <input
                      type="time"
                      required
                      value={formData.endTime}
                      onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                      className="w-full bg-dark-900 border border-dark-700 rounded-lg px-3 py-2 text-xs text-dark-50 focus:outline-none focus:border-primary-500/50"
                    />
                  </div>
                </div>

                <div className="space-y-0.5">
                  <label className="text-[10px] font-semibold text-dark-200">Venue *</label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    placeholder="e.g. Jubilee Hall, CSE Lab"
                    className="w-full bg-dark-900 border border-dark-700 rounded-lg px-3 py-2 text-xs text-dark-50 focus:outline-none focus:border-primary-500/50"
                  />
                </div>

                <div className="space-y-0.5">
                  <label className="text-[10px] font-semibold text-dark-200">Description *</label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Describe details of this event..."
                    className="w-full bg-dark-900 border border-dark-700 rounded-lg px-3 py-2 text-xs text-dark-50 focus:outline-none focus:border-primary-500/50 h-16 resize-none"
                  />
                </div>

                <div className="pt-3 border-t border-dark-700/50 flex gap-2 justify-end shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-3.5 py-1.5 text-xs font-semibold border border-dark-750 text-dark-300 hover:text-white rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-1.5 text-xs font-semibold bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors flex items-center justify-center gap-1 disabled:opacity-50"
                  >
                    {submitting ? (
                      <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <span>Create</span>
                    )}
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EventCalendar;
