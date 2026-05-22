import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineChat,
  HiX,
  HiChevronDown,
  HiChevronUp,
  HiOutlineQuestionMarkCircle,
  HiOutlineShieldCheck,
  HiOutlineArrowRight,
  HiOutlineTicket,
  HiArrowLeft,
} from 'react-icons/hi';
import { FiSend, FiLoader } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const FAQS = [
  {
    question: 'How do I buy an item?',
    answer: 'Click the "Contact Agent to Buy" button on any listing page. Your designated class agent will automatically coordinate the deal and secure your purchase.',
  },
  {
    question: 'How do I sell an item?',
    answer: 'Go to the "Start Selling" page (available in the navbar navigation or quick links), fill out the description, condition, pricing details, and upload an image.',
  },
  {
    question: 'What is the 10% platform fee?',
    answer: 'We collect a 10% broker fee on completed transactions to compensate the student agents for coordinating the delivery and safety of items.',
  },
  {
    question: 'Why is my phone number hidden?',
    answer: 'To ensure a safe environment, all phone numbers inside chat messages are automatically masked. All coordinates must go through the messaging system.',
  },
];

const TICKET_CATEGORIES = [
  { value: 'account', label: 'Account Issue' },
  { value: 'listing', label: 'Listing Problem' },
  { value: 'payment', label: 'Payment & Fees' },
  { value: 'agent', label: 'Agent Issue' },
  { value: 'other', label: 'Other' },
];

const TICKET_PRIORITIES = [
  { value: 'low', label: 'Low', color: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10' },
  { value: 'medium', label: 'Medium', color: 'text-amber-400 border-amber-500/40 bg-amber-500/10' },
  { value: 'high', label: 'High', color: 'text-red-400 border-red-500/40 bg-red-500/10' },
];

const SupportWidget = () => {
  const { isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);
  const [view, setView] = useState('main'); // 'main' | 'ticket'
  const [ticketForm, setTicketForm] = useState({
    subject: '',
    category: '',
    priority: 'medium',
    description: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const widgetRef = useRef(null);
  const navigate = useNavigate();

  // Reset view when widget closes
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => setView('main'), 300);
    }
  }, [isOpen]);

  // Close widget when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (widgetRef.current && !widgetRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAgentChat = () => {
    setIsOpen(false);
    if (isAuthenticated) {
      navigate('/messages');
    } else {
      navigate('/login', { state: { from: '/messages' } });
    }
  };

  const handleOpenTicket = () => {
    if (!isAuthenticated) {
      setIsOpen(false);
      navigate('/login');
      return;
    }
    setView('ticket');
  };

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const handleTicketSubmit = async (e) => {
    e.preventDefault();
    if (!ticketForm.subject.trim() || !ticketForm.category || !ticketForm.description.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/tickets', ticketForm);
      toast.success('Ticket submitted! We\'ll get back to you soon.');
      setTicketForm({ subject: '', category: '', priority: 'medium', description: '' });
      setView('main');
      setIsOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit ticket');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div ref={widgetRef} className="fixed bottom-6 right-6 z-50">
      {/* Floating Action Button — pill shaped with label */}
      <AnimatePresence mode="wait">
        {isOpen ? (
          <motion.button
            key="close-btn"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ duration: 0.18 }}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2 px-4 py-3 rounded-full bg-dark-700 border border-dark-600 hover:bg-dark-600 text-dark-100 shadow-lg transition-all duration-200 focus:outline-none"
            id="support-fab"
            aria-label="Close support menu"
          >
            <HiX className="text-lg" />
            <span className="text-sm font-semibold">Close</span>
          </motion.button>
        ) : (
          <motion.button
            key="support-btn"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ duration: 0.18 }}
            whileHover={{ scale: 1.06, y: -2 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => setIsOpen(true)}
            className="relative flex items-center gap-2.5 px-5 py-3 rounded-full bg-primary-500 hover:bg-primary-600 text-white shadow-lg hover:shadow-glow transition-all duration-300 focus:outline-none"
            id="support-fab"
            aria-label="Open support menu"
          >
            {/* Pulsing ring */}
            <span className="absolute inset-0 rounded-full border-2 border-primary-400 animate-ping opacity-20" />
            {/* Question mark badge */}
            <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-white font-black text-sm leading-none">
              ?
            </span>
            <span className="text-sm font-bold tracking-wide">Support</span>
          </motion.button>
        )}
      </AnimatePresence>


      {/* Support Card Popup */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="absolute bottom-full mb-3 right-0 w-80 sm:w-96 glass-card shadow-2xl overflow-hidden border border-dark-700/80"
          >
            {/* Header */}
            <div className="p-4 bg-primary-500/10 border-b border-dark-700/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {view === 'ticket' && (
                  <button
                    onClick={() => setView('main')}
                    className="p-1 rounded-lg text-dark-400 hover:text-dark-100 hover:bg-dark-700/50 transition-colors mr-1"
                  >
                    <HiArrowLeft className="text-lg" />
                  </button>
                )}
                <div className="w-8 h-8 rounded-lg bg-primary-500/20 text-primary-400 flex items-center justify-center">
                  {view === 'ticket' ? <HiOutlineTicket className="text-lg" /> : <HiOutlineChat className="text-lg" />}
                </div>
                <div>
                  <h3 className="font-semibold text-dark-50 text-sm">
                    {view === 'ticket' ? 'Create a Ticket' : 'Campus Support'}
                  </h3>
                  <span className="text-xs text-accent-500 font-medium">
                    {view === 'ticket' ? 'We\'ll reply via email' : 'Class Agents Active'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-dark-400 hover:text-dark-100 hover:bg-dark-700/50 transition-colors"
              >
                <HiX className="text-lg" />
              </button>
            </div>

            <AnimatePresence mode="wait">
              {view === 'main' ? (
                <motion.div
                  key="main-view"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.15 }}
                >
                  {/* Content Body */}
                  <div className="p-4 max-h-[420px] overflow-y-auto no-scrollbar space-y-3">
                    {/* Primary Call to Action — Contact Agent */}
                    <button
                      onClick={handleAgentChat}
                      className="w-full btn-primary py-3 px-4 rounded-xl flex items-center justify-between group shadow-glow"
                    >
                      <div className="text-left">
                        <p className="text-sm font-bold text-white">Contact Class Agent</p>
                        <p className="text-xs text-primary-100 mt-0.5">Solve queries & coordinate trades</p>
                      </div>
                      <HiOutlineArrowRight className="text-lg group-hover:translate-x-1 transition-transform" />
                    </button>

                    {/* Create a Ticket CTA */}
                    <button
                      onClick={handleOpenTicket}
                      className="w-full py-3 px-4 rounded-xl flex items-center justify-between group border border-dark-600 bg-dark-800/50 hover:border-primary-500/40 hover:bg-primary-500/5 transition-all duration-200"
                    >
                      <div className="text-left">
                        <p className="text-sm font-semibold text-dark-100 group-hover:text-primary-400 transition-colors">Create a Support Ticket</p>
                        <p className="text-xs text-dark-400 mt-0.5">Get help from the admin team</p>
                      </div>
                      <HiOutlineTicket className="text-lg text-dark-400 group-hover:text-primary-400 transition-colors" />
                    </button>

                    {/* Quick links grid */}
                    <div className="grid grid-cols-2 gap-2">
                      <Link
                        to="/search"
                        onClick={() => setIsOpen(false)}
                        className="p-2.5 rounded-xl border border-dark-700 bg-dark-800/40 text-center hover:border-primary-500/40 hover:bg-primary-500/5 transition-all text-xs font-semibold text-dark-200 hover:text-primary-400"
                      >
                        Browse Items
                      </Link>
                      <Link
                        to="/sell"
                        onClick={() => setIsOpen(false)}
                        className="p-2.5 rounded-xl border border-dark-700 bg-dark-800/40 text-center hover:border-primary-500/40 hover:bg-primary-500/5 transition-all text-xs font-semibold text-dark-200 hover:text-primary-400"
                      >
                        Start Selling
                      </Link>
                    </div>

                    {/* FAQ Accordion */}
                    <div>
                      <h4 className="text-xs font-bold text-dark-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <HiOutlineQuestionMarkCircle className="text-sm" />
                        Frequently Asked Questions
                      </h4>
                      <div className="space-y-1.5">
                        {FAQS.map((faq, idx) => {
                          const isFaqOpen = activeFaq === idx;
                          return (
                            <div
                              key={idx}
                              className="rounded-lg border border-dark-700/60 bg-dark-800/20 overflow-hidden"
                            >
                              <button
                                onClick={() => toggleFaq(idx)}
                                className="w-full p-2.5 text-left text-xs font-medium text-dark-100 hover:bg-dark-800/40 flex items-center justify-between transition-colors"
                              >
                                <span className="pr-4">{faq.question}</span>
                                {isFaqOpen ? (
                                  <HiChevronUp className="text-dark-400 shrink-0 text-sm" />
                                ) : (
                                  <HiChevronDown className="text-dark-400 shrink-0 text-sm" />
                                )}
                              </button>
                              <AnimatePresence initial={false}>
                                {isFaqOpen && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2, ease: 'easeInOut' }}
                                    className="overflow-hidden"
                                  >
                                    <p className="p-2.5 pt-0 text-xs text-dark-400 leading-relaxed border-t border-dark-700/40">
                                      {faq.answer}
                                    </p>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="ticket-view"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.15 }}
                >
                  <form onSubmit={handleTicketSubmit} className="p-4 space-y-3 max-h-[420px] overflow-y-auto no-scrollbar">
                    {/* Subject */}
                    <div>
                      <label className="text-xs font-semibold text-dark-300 mb-1.5 block">Subject <span className="text-red-400">*</span></label>
                      <input
                        type="text"
                        value={ticketForm.subject}
                        onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                        placeholder="Brief title of your issue"
                        maxLength={150}
                        required
                        className="w-full bg-dark-800 border border-dark-700 text-dark-100 text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 placeholder-dark-500 transition-all"
                      />
                    </div>

                    {/* Category */}
                    <div>
                      <label className="text-xs font-semibold text-dark-300 mb-1.5 block">Category <span className="text-red-400">*</span></label>
                      <select
                        value={ticketForm.category}
                        onChange={(e) => setTicketForm({ ...ticketForm, category: e.target.value })}
                        required
                        className="w-full bg-dark-800 border border-dark-700 text-dark-100 text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                      >
                        <option value="">Select a category</option>
                        {TICKET_CATEGORIES.map((c) => (
                          <option key={c.value} value={c.value}>{c.label}</option>
                        ))}
                      </select>
                    </div>

                    {/* Priority */}
                    <div>
                      <label className="text-xs font-semibold text-dark-300 mb-1.5 block">Priority</label>
                      <div className="flex gap-2">
                        {TICKET_PRIORITIES.map((p) => (
                          <button
                            key={p.value}
                            type="button"
                            onClick={() => setTicketForm({ ...ticketForm, priority: p.value })}
                            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                              ticketForm.priority === p.value ? p.color : 'border-dark-700 text-dark-400 bg-dark-800/40 hover:border-dark-600'
                            }`}
                          >
                            {p.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="text-xs font-semibold text-dark-300 mb-1.5 block">Description <span className="text-red-400">*</span></label>
                      <textarea
                        value={ticketForm.description}
                        onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
                        placeholder="Describe your issue in detail..."
                        rows={4}
                        maxLength={2000}
                        required
                        className="w-full bg-dark-800 border border-dark-700 text-dark-100 text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 placeholder-dark-500 transition-all resize-none"
                      />
                      <p className="text-right text-[10px] text-dark-500 mt-0.5">{ticketForm.description.length}/2000</p>
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full btn-primary py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm font-bold disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {submitting ? (
                        <><FiLoader className="animate-spin" /> Submitting...</>
                      ) : (
                        <><FiSend /> Submit Ticket</>
                      )}
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Footer details */}
            <div className="p-3 bg-dark-800/80 border-t border-dark-700/60 flex items-center justify-between text-[10px] text-dark-500 font-medium px-4">
              <span className="flex items-center gap-1">
                <HiOutlineShieldCheck className="text-xs text-primary-400" />
                TKMC Verified
              </span>
              <span>100% Student Protected</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SupportWidget;
