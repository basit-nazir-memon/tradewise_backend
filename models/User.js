const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const userSchema = new Schema({
    fullName: { type: String, required: true },
    username: { type: String, unique: true, required: true },
    email: { type: String, unique: true, required: true },
    userInfo: { type: String, required: true },
    ProfileImage: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    blocked: { type: Boolean, default: false }
})

const User = mongoose.model('User', userSchema);

module.exports = User;