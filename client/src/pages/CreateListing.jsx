import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import api from '../services/api';
import { FiUploadCloud, FiX } from 'react-icons/fi';

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
  'Others'
];

const CONDITIONS = ['New', 'Like New', 'Good', 'Fair'];

const CreateListing = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    condition: '',
    location: '',
    isNegotiable: false,
  });
  const [images, setImages] = useState([]);
  const [imagePreview, setImagePreview] = useState([]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length + images.length > 5) {
      toast.error('You can only upload up to 5 images');
      return;
    }

    setImages(prev => [...prev, ...files]);

    // Create previews
    const filePreviews = files.map(file => URL.createObjectURL(file));
    setImagePreview(prev => [...prev, ...filePreviews]);
  };

  const removeImage = (index) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);

    const newPreviews = [...imagePreview];
    newPreviews.splice(index, 1);
    setImagePreview(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create listing data object
      // For now, we simulate image uploads since we haven't configured Cloudinary yet.
      // We will just send the data. In a real app we'd use FormData to upload images first.
      
      const payload = {
        ...formData,
        price: Number(formData.price),
        images: imagePreview // Using local preview URLs temporarily for demo purposes
      };

      const res = await api.post('/listings', payload);
      toast.success('Listing created successfully!');
      navigate(`/listing/${res.data._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Sell an Item</h1>
        <p className="text-slate-400">Fill in the details below to list your item for sale.</p>
      </div>

      <div className="glass-card p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white border-b border-slate-700/50 pb-2">Basic Details</h2>
            
            <Input
              label="Listing Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., iPhone 13 Pro Max - 256GB"
              required
              maxLength={100}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Price (₹)"
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="e.g., 5000"
                required
                min="0"
              />
              <div className="flex flex-col justify-end pb-2">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isNegotiable"
                    checked={formData.isNegotiable}
                    onChange={handleChange}
                    className="w-5 h-5 rounded border-slate-600 bg-dark-800 text-primary-500 focus:ring-primary-500/50"
                  />
                  <span className="text-slate-300">Price is negotiable</span>
                </label>
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4">
            <h2 className="text-xl font-semibold text-white border-b border-slate-700/50 pb-2">Categories & Condition</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col space-y-1.5">
                <label className="text-sm font-medium text-slate-300">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="bg-dark-800 border border-slate-700 text-white rounded-xl px-4 py-2.5 transition-all outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20"
                >
                  <option value="" disabled>Select a category</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col space-y-1.5">
                <label className="text-sm font-medium text-slate-300">Condition</label>
                <select
                  name="condition"
                  value={formData.condition}
                  onChange={handleChange}
                  required
                  className="bg-dark-800 border border-slate-700 text-white rounded-xl px-4 py-2.5 transition-all outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20"
                >
                  <option value="" disabled>Select condition</option>
                  {CONDITIONS.map(cond => (
                    <option key={cond} value={cond}>{cond}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4">
            <h2 className="text-xl font-semibold text-white border-b border-slate-700/50 pb-2">Description & Location</h2>
            
            <div className="flex flex-col space-y-1.5">
              <label className="text-sm font-medium text-slate-300">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows="4"
                placeholder="Describe your item, its features, reason for selling, etc."
                className="bg-dark-800 border border-slate-700 text-white rounded-xl px-4 py-2.5 transition-all outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 resize-y"
              ></textarea>
            </div>

            <Input
              label="Location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g., Mens Hostel Block A / CSE Department"
              required
            />
          </div>

          <div className="space-y-4 pt-4">
            <h2 className="text-xl font-semibold text-white border-b border-slate-700/50 pb-2">Images (Max 5)</h2>
            
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-700 border-dashed rounded-xl cursor-pointer bg-dark-800 hover:bg-dark-700 hover:border-primary-500 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6 text-slate-400">
                  <FiUploadCloud className="w-8 h-8 mb-3 text-primary-500" />
                  <p className="text-sm font-medium">Click to upload images</p>
                  <p className="text-xs text-slate-500 mt-1">PNG, JPG, JPEG up to 5MB</p>
                </div>
                <input 
                  type="file" 
                  className="hidden" 
                  multiple 
                  accept="image/jpeg, image/png, image/jpg" 
                  onChange={handleImageChange}
                  disabled={images.length >= 5}
                />
              </label>
            </div>

            {/* Image Previews */}
            {imagePreview.length > 0 && (
              <div className="flex flex-wrap gap-4 mt-4">
                {imagePreview.map((url, index) => (
                  <div key={index} className="relative group rounded-lg overflow-hidden w-24 h-24 border border-slate-700">
                    <img src={url} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-red-500/80 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
                    >
                      <FiX size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-6">
            <Button 
              type="submit" 
              variant="primary" 
              className="w-full py-3 text-lg"
              disabled={loading}
            >
              {loading ? 'Creating Listing...' : 'Post Listing'}
            </Button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default CreateListing;
