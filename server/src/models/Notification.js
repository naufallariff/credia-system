const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipient_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true,
        index: true
    },
    type: { 
        type: String, 
        enum: ['INFO', 'WARNING', 'SUCCESS', 'ERROR'], 
        default: 'INFO' 
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    is_read: { type: Boolean, default: false },
    action_link: { type: String },
    related_id: { type: String } 
}, {
    timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema);