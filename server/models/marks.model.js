const mongoose = require('mongoose')

const marksSchema = mongoose.Schema({
    student: {
        type: Schema.Types.ObjectId,
        ref: 'Student'
    },
    subject: {
        type: Schema.Types.ObjectId,
        ref: 'Subject'
    },
    exam: {
        type: String,
        required:true
    },
    marks: {
        type: Number,
        default: 0
    },
    totalMarks: {
        type: Number,
        default: 100
    },
    class: {
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
