const mongoose = require('mongoose')

const leaveSchema = mongoose.Schema({
    name: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student"
    },
    LeaveMessage: {
        type: String,
        required: true,
    },
    reson:{
        type:String,
        required:true,
    }
}, {
    timestamp: true,
}
)

module.exports = mongoose.model('Leave', leaveSchema)
