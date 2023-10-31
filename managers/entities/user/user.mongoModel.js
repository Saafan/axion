const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  type: {
    type: String, // 'superadmin' or 'admin' or 'student'
    default: "unassigned",
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
