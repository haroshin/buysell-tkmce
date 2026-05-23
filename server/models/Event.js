import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add an event title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add an event description'],
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  date: {
    type: Date,
    required: [true, 'Please select a start date']
  },
  endDate: {
    type: Date,
    required: [true, 'Please select an end date']
  },
  startTime: {
    type: String,
    required: [true, 'Please add a start time']
  },
  endTime: {
    type: String,
    required: [true, 'Please add an end time']
  },
  location: {
    type: String,
    required: [true, 'Please specify the event location']
  },
  organizer: {
    type: String,
    required: [true, 'Please specify the organizer (e.g. Dept or Club)']
  },
  category: {
    type: String,
    required: [true, 'Please select a category'],
    enum: [
      'Academic',
      'Technical Fest',
      'Cultural Fest',
      'Workshop/Seminar',
      'Sports',
      'Club Meeting',
      'Exam/Test',
      'Other'
    ]
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isVerified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const Event = mongoose.model('Event', eventSchema);
export default Event;
