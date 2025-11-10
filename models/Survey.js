const mongoose = require('mongoose');

const SurveySchema = new mongoose.Schema({
  // ...existing fields...
  schedule: {
    startDate: Date,
    endDate: Date,
    timezone: { type: String, default: 'UTC' },
    autoPublish: { type: Boolean, default: false },
    repeat: {
      enabled: { type: Boolean, default: false },
      frequency: {
        type: String,
        enum: ['daily', 'weekly', 'monthly'],
        required: function () { return this.enabled === true; }
      },
      endRepeatDate: Date
    }
  }
  // ...existing code...
  
});

module.exports = mongoose.model('Survey', SurveySchema);