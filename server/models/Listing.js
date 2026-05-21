import mongoose from 'mongoose';

const listingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [100, 'Title can not be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [1000, 'Description can not be more than 1000 characters']
  },
  price: {
    type: Number,
    required: [true, 'Please add a price']
  },
  category: {
    type: String,
    required: [true, 'Please select a category'],
    enum: [
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
    ]
  },
  condition: {
    type: String,
    required: [true, 'Please select a condition'],
    enum: ['New', 'Like New', 'Good', 'Fair']
  },
  images: {
    type: [String],
    validate: [arrayLimit, 'You can upload a maximum of 5 images']
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  location: {
    type: String,
    required: [true, 'Please add a location (e.g., Hostel Name or Department)']
  },
  isNegotiable: {
    type: Boolean,
    default: false
  },
  isSold: {
    type: Boolean,
    default: false
  },
  soldAt: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },
  views: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

function arrayLimit(val) {
  return val.length <= 5;
}

const Listing = mongoose.model('Listing', listingSchema);
export default Listing;
