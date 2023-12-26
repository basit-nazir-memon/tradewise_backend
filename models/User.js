const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  fullName: { type: String, required: true },
  username: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  blocked: { type: Boolean, default: false },
  gender: { type: String, enum: ["male", "female"] },
  hashtag: { type: [String] }, // Array of tags
  dob: { type: Date }, // Date of birth
  location: { type: String }, // Location
  bio: { type: String }, // Paragraph describing a person
});

const User = mongoose.model("User", userSchema);

module.exports = User;
