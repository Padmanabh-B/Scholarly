const mongoose = require('mongoose')

const subjectSchema = mongoose.Schema({
    class: {
        type: String,
        required: true
    },
    subjectCode: {
        type: String,
        required: true,
        unique: true,
    },
    subjectName: {
        type: String,
        required: true,
        trim: true,
        unique: true,
    },
    totalClasses: {
        type: Number,
        default: 50
    },
    year: {
        type: String,
        required: true
    },
    attendence: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'attendence'
    }
})

module.exports = mongoose.model('subject', subjectSchema)




