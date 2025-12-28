const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    custom_id: { 
        type: String, 
        unique: true,
        index: true 
    },
    username: { 
        type: String, 
        required: true, 
        unique: true,
        trim: true,
        index: true
    },
    email: { 
        type: String, 
        required: true, 
        unique: true,
        lowercase: true,
        trim: true
    },
    password: { 
        type: String, 
        required: true,
        select: false
    },
    name: { 
        type: String, 
        required: true 
    },
    role: { 
        type: String, 
        enum: ['SUPERADMIN', 'ADMIN', 'STAFF', 'CLIENT', 'LEAD'], 
        default: 'LEAD' 
    },
    status: {
        type: String,
        enum: ['ACTIVE', 'SUSPENDED', 'UNVERIFIED', 'BANNED'],
        default: 'UNVERIFIED'
    },
    must_change_password: { 
        type: Boolean, 
        default: false 
    },
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    last_login_at: { type: Date },
    login_attempts: { type: Number, default: 0 }
}, {
    timestamps: true
});

userSchema.pre('save', async function() {
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);