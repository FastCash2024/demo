const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    }
}, { timestamps: true });

// 👇 ESTA ES LA LÍNEA MÁGICA QUE FALTA O ESTÁ ROTA 👇      
module.exports = mongoose.model('User', userSchema);