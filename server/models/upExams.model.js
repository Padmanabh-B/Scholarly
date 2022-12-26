const mongoose = require('mongoose')

const upcommingExamSchema = mongoose.Schema({
    studentClass: {
        type: String,
        require: [true, 'Please Provide Class']
    },
    subjectCode: {
        type: String,
        require: [true, 'Please Provide Subject Code']
    },
    exam: {
        type: String,
        require: [true, 'Please Provide  Exam Name']
    },
    totalMarks: {
        type: Number,
        require: [true, 'Please Provide Total Marks'],
        default: 100
    },
    date: {
        type: Date,
        default: new Date() + 7
    }
}, {
    timestamp: true,
}
)

module.exports = mongoose.model('UpcommingExam', upExamSchema)
