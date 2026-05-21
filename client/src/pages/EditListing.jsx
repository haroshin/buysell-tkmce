import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import {
  FiEdit3,
  FiSave,
  FiArrowLeft,
  FiX,
  FiImage,
} from 'react-icons/fi';

const CATEGORIES = [
  'Textbooks & Notes',
  'Electronics',
  'Project Components',
  'Gaming',
  'Hostel Essentials',
  'Fashion',
  'Pets',
  'Sports & Fitness',
  'Transport',
  'Events & Tickets',
  'Others',
];

const CONDITIONS = ['New', 'Like New', 'Good', 'Fair'];

const EditListing = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    condition: '',
    location: '',
    isNegotiable: false,
    images: [],
  });

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const { data } = await api.get(`/listings/${id}`);

        // Verify ownership
        if (data.seller?._id !== user?._id) {
          toast.error('You can only edit your own listings');
          navigate('/my-listings');
          return;
        }

        setForm({
          title: data.title || '',
          description: data.description || '',
          price: data.price || '',
          category: data.category || '',
          condition: data.condition || '',
          location: data.location || '',
          isNegotiable: data.isNegotiable || false,
          images: data.images || [],
        });
      } catch (error) {
        console.error('Failed to fetch listing', error);
        toast.error('Listing not found');
        navigate('/my-listings');
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id, user, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleRemoveImage = (index) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim() || !form.description.trim() || !form.price || !form.category || !form.condition || !form.location.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price),
      };

      await api.put(`/listings/${id}`, payload);
      toast.success('Listing updated successfully!');
      navigate(`/listing/${id}`);
    } catch (error) {
      console.error('Failed to update listing', error);
      toast.error(error.response?.data?.message || 'Failed to update listing');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-20 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="page-container max-w-3xl">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-dark-400 hover:text-white transition-colors mb-4 text-sm"
          >
            <FiArrowLeft /> Back
          </button>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-500/15 flex items-center justify-center">
              <FiEdit3 className="text-xl text-primary-400" />
            </div>
            Edit Listing
          </h1>
        </motion.div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          onSubmit={handleSubmit}
          className="glass-card p-8 space-y-6"
        >
          {/* Title */}
          <Input
            label="Title *"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="e.g., Engineering Mathematics Textbook"
            required
            id="edit-listing-title"
          />

          {/* Description */}
          <div className="flex flex-col space-y-1.5">
            <label className="text-sm font-medium text-slate-300">Description *</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe the item in detail — condition, brand, reason for selling..."
              rows={5}
              required
              className="bg-dark-800 border border-slate-700 text-white rounded-xl px-4 py-3 transition-all outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 placeholder:text-slate-500 resize-none"
              id="edit-listing-description"
            />
          </div>

          {/* Price & Category Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Input
              label="Price (₹) *"
              name="price"
              type="number"
              value={form.price}
              onChange={handleChange}
              placeholder="Enter price"
              min="0"
              required
              id="edit-listing-price"
            />

            <div className="flex flex-col space-y-1.5">
              <label className="text-sm font-medium text-slate-300">Category *</label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                required
                className="bg-dark-800 border border-slate-700 text-white rounded-xl px-4 py-2.5 transition-all outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20"
                id="edit-listing-category"
              >
                <option value="">Select Category</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Condition & Location Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="flex flex-col space-y-1.5">
              <label className="text-sm font-medium text-slate-300">Condition *</label>
              <select
                name="condition"
                value={form.condition}
                onChange={handleChange}
                required
                className="bg-dark-800 border border-slate-700 text-white rounded-xl px-4 py-2.5 transition-all outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20"
                id="edit-listing-condition"
              >
                <option value="">Select Condition</option>
                {CONDITIONS.map((cond) => (
                  <option key={cond} value={cond}>{cond}</option>
                ))}
              </select>
            </div>

            <Input
              label="Location *"
              name="location"
              value={form.location}
              onChange={handleChange}
              placeholder="e.g., Boys Hostel A / CSE Dept"
              required
              id="edit-listing-location"
            />
          </div>

          {/* Negotiable Toggle */}
          <div className="flex items-center gap-3">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="isNegotiable"
                checked={form.isNegotiable}
                onChange={handleChange}
                className="sr-only peer"
                id="edit-listing-negotiable"
              />
              <div className="w-11 h-6 bg-dark-700 rounded-full peer peer-checked:bg-primary-500 transition-colors duration-300 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
            </label>
            <span className="text-sm text-dark-200 font-medium">Price is negotiable</span>
          </div>

          {/* Current Images */}
          {form.images.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <FiImage className="text-primary-500" /> Current Images
              </label>
              <div className="flex gap-3 flex-wrap">
                {form.images.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative group w-24 h-24 rounded-xl overflow-hidden border-2 border-dark-600"
                  >
                    <img src={img} alt={`Image ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <FiX className="text-white text-xl" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Submit */}
          <div className="flex gap-3 pt-4 border-t border-dark-700">
            <Button type="submit" disabled={saving} className="px-8 py-3">
              <FiSave className="mr-2" />
              {saving ? 'Saving...' : 'Update Listing'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate(-1)}
              className="px-6 py-3"
            >
              Cancel
            </Button>
          </div>
        </motion.form>

      </div>
    </div>
  );
};

export default EditListing;
