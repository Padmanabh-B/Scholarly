const mongoose = require('mongoose')

const attendenceSchema = mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
    },
    subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject'
    },
    totalClassesByStaff: {
        type: Number,
        default: 0
    },
    classesAttended: {
        type: Number,
        default: 0
    }
})

module.exports = mongoose.model('Attendence', attendenceSchema)
