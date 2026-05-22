import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { DEPARTMENTS, A_B_SECTION_DEPARTMENTS, SINGLE_SECTION_DEPARTMENTS, NO_SECTION_DEPARTMENTS } from '../../utils/constants';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { HiOutlineAcademicCap, HiOutlineCalendar, HiOutlinePhone, HiOutlineUserGroup } from 'react-icons/hi';

const CompleteProfileModal = () => {
  const { user, updateUser, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    department: '',
    passoutYear: '',
    section: '',
    phone: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  // Check if profile is incomplete
  const isProfileIncomplete = () => {
    if (!user) return false;
    if (!user.department || !user.passoutYear) return true;

    const hasMultipleSections = user.department === 'Mechanical Engineering';
    const hasABSections = A_B_SECTION_DEPARTMENTS.has(user.department);
    if ((hasMultipleSections || hasABSections) && (!user.section || user.section === 'None')) {
      return true;
    }

    return false;
  };

  const showModal = isAuthenticated && isProfileIncomplete();

  // Section visibility rules
  const hasMultipleSections = formData.department === 'Mechanical Engineering';
  const hasABSections = A_B_SECTION_DEPARTMENTS.has(formData.department);
  const isSingleSection = SINGLE_SECTION_DEPARTMENTS.has(formData.department);
  const isNoSection = NO_SECTION_DEPARTMENTS.has(formData.department);
  const showSectionPicker = formData.department && !isNoSection;

  useEffect(() => {
    if (showModal && user) {
      setFormData({
        department: user.department || '',
        passoutYear: user.passoutYear || '',
        section: user.section === 'None' ? '' : (user.section || ''),
        phone: user.phone || '',
      });
    }
  }, [showModal, user]);

  // Handle department section updates
  useEffect(() => {
    if (!formData.department) return;

    if (hasMultipleSections || hasABSections) {
      setFormData((prev) => ({ ...prev, section: '' }));
    } else if (isSingleSection) {
      setFormData((prev) => ({ ...prev, section: 'A' }));
    } else {
      setFormData((prev) => ({ ...prev, section: 'None' }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.department]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.department || !formData.passoutYear || !formData.section) {
      toast.error('Please fill in all mandatory fields');
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.put('/users/profile', formData);
      updateUser(response.data.user);
      toast.success('Profile setup completed successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!showModal) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
        {/* Blurred background overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-dark-950/80 backdrop-blur-md"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-lg bg-dark-900 border border-slate-700/50 rounded-2xl p-8 sm:p-10 shadow-2xl relative z-10 overflow-hidden"
        >
          {/* Accent light source */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-accent-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Header */}
          <div className="text-center mb-8 relative">
            <div className="w-14 h-14 rounded-2xl bg-primary-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-500/20">
              <HiOutlineAcademicCap className="text-white text-3xl" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Complete Your Profile</h2>
            <p className="text-dark-400 text-sm">
              Please set up your department details to access the Buy&Sell campus marketplace.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 relative">
            {/* Department */}
            <div>
              <label htmlFor="modal-department" className="block text-sm font-medium text-dark-200 mb-1.5">
                Department
              </label>
              <div className="relative">
                <HiOutlineAcademicCap className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-400 animate-pulse" />
                <select
                  id="modal-department"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="input-field pl-10"
                  required
                >
                  <option value="">Select Department</option>
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Passout Year */}
            <div>
              <label htmlFor="modal-passoutYear" className="block text-sm font-medium text-dark-200 mb-1.5">
                Passout Year
              </label>
              <div className="relative">
                <HiOutlineCalendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-400" />
                <select
                  id="modal-passoutYear"
                  name="passoutYear"
                  value={formData.passoutYear}
                  onChange={handleChange}
                  className="input-field pl-10"
                  required
                >
                  <option value="">Select Passout Year</option>
                  {Array.from({ length: 6 }, (_, i) => new Date().getFullYear() + i).map((yr) => (
                    <option key={yr} value={yr}>
                      {yr}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Section Picker */}
            {showSectionPicker && (
              <div>
                <label htmlFor="modal-section" className="block text-sm font-medium text-dark-200 mb-1.5">
                  Section
                </label>
                <div className="relative">
                  <HiOutlineUserGroup className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-400" />
                  <select
                    id="modal-section"
                    name="section"
                    value={formData.section}
                    onChange={handleChange}
                    className="input-field pl-10 disabled:opacity-50 disabled:cursor-not-allowed"
                    required
                    disabled={isSingleSection}
                  >
                    {isSingleSection ? (
                      <option value="A">Section A</option>
                    ) : (
                      <>
                        <option value="">Select Section</option>
                        <option value="A">Section A</option>
                        <option value="B">Section B</option>
                        {hasMultipleSections && (
                          <option value="C">Section C</option>
                        )}
                      </>
                    )}
                  </select>
                </div>
                {isSingleSection && (
                  <p className="text-xs text-dark-400 mt-1 pl-1">
                    Section A is auto-assigned for this department.
                  </p>
                )}
              </div>
            )}

            {/* Phone Number (Optional) */}
            <div>
              <label htmlFor="modal-phone" className="block text-sm font-medium text-dark-200 mb-1.5">
                Phone Number (Optional)
              </label>
              <div className="relative">
                <HiOutlinePhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-400" />
                <input
                  id="modal-phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 XXXXX XXXXX"
                  className="input-field pl-10"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full py-3 flex items-center justify-center gap-2 mt-4 cursor-pointer shadow-lg shadow-primary-500/20 active:scale-[0.98] transition-transform"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Save and Continue'
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CompleteProfileModal;
