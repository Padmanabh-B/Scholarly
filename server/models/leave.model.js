const mongoose = require('mongoose')

const leaveSchema = mongoose.Schema({
    rollNo: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    reson: {
        type: String,
        required: true,
    },
    leaveMessage: {
        type: String,
        required: true,
    },
    leavefrom: {
        type: String,
        requried: true
    },
    leaveto: {
        type: String,
        required: true
    },
    totaldays: {
        type: Number,
        requied: true,
        default: 1,
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'denied'],
        default: 'pending'
    },
}, {
    timestamp: true,
}
)

module.exports = mongoose.model('Leave', leaveSchema)
