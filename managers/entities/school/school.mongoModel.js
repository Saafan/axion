const mongoose = require('mongoose');

const schoolSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
});

// Define a unique compound index on 'name' and 'address' fields
schoolSchema.index({ name: 1, address: 1 }, { unique: true });

const School = mongoose.model('School', schoolSchema);

module.exports = School;