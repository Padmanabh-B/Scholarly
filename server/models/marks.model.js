const mongoose = require('mongoose')

const marksSchema = mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
    },
    subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject'
    },
    exam: {
        type: String,
        required:true
    },
    marks: {
        type: Number,
        require:[true,"Enter A Valid Number"],
        default: 0
    },
    totalMarks: {
        type: Number,
        default: 100
    },
    studentClass: {
        type:String
    },
    semester: {
        type:Number
    },
    section: {
        type:String
    }
})

module.exports = mongoose.model('Marks', marksSchema)
