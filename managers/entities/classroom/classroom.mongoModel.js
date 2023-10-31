const mongoose = require("mongoose");

const classroomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "School",
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
});

// Define a unique compound index on 'name' and 'schoolId' fields
classroomSchema.index({ name: 1, schoolId: 1 }, { unique: true });

const Classroom = mongoose.model("Classroom", classroomSchema);

module.exports = Classroom;
