const mongoose = require('mongoose')

const achivements = mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
    },
    Drawing: {
        type: String,
        required: [true, 'Please Choose From - A+, A, B+, B, C+, C'],
        enum: {
            values: [
                'A+',
                'A',
                'B+',
                'B',
                'C+',
                'C',
            ],
            message: "Please Choose Any One - A+, A, B+, B, C+, C",
        }
    },
    Emotional_SocialSkills: {
        type: String,
        required: [true, 'Please Choose From - A+, A, B+, B, C+, C'],
        enum: {
            values: [
                'A+',
                'A',
                'B+',
                'B',
                'C+',
                'C',
            ],
            message: "Please Choose Any One - A+, A, B+, B, C+, C",
        }
    },
    Organisation_Skills: {
        type: String,
        required: [true, 'Please Choose From - A+, A, B+, B, C+, C'],
        enum: {
            values: [
                'A+',
                'A',
                'B+',
                'B',
                'C+',
                'C',
            ],
            message: "Please Choose Any One - A+, A, B+, B, C+, C",
        }
    },
    Scientific_Skills: {
        type: String,
        required: [true, 'Please Choose From - A+, A, B+, B, C+, C'],
        enum: {
            values: [
                'A+',
                'A',
                'B+',
                'B',
                'C+',
                'C',
            ],
            message: "Please Choose Any One - A+, A, B+, B, C+, C",
        }
    },
    Fine_Arts: {
        type: String,
        required: [true, 'Please Choose From - A+, A, B+, B, C+, C'],
        enum: {
            values: [
                'A+',
                'A',
                'B+',
                'B',
                'C+',
                'C',
            ],
            message: "Please Choose Any One - A+, A, B+, B, C+, C",
        }
    },
    Attitudes: {
        type: String,
        required: [true, 'Please Choose From - A+, A, B+, B, C+, C'],
        enum: {
            values: [
                'A+',
                'A',
                'B+',
                'B',
                'C+',
                'C',
            ],
            message: "Please Choose Any One - A+, A, B+, B, C+, C",
        }
    },
    Creative_Skills: {
        type: String,
        required: [true, 'Please Choose From - A+, A, B+, B, C+, C'],
        enum: {
            values: [
                'A+',
                'A',
                'B+',
                'B',
                'C+',
                'C',
            ],
            message: "Please Choose Any One - A+, A, B+, B, C+, C",
        }
    },
    Moral_Skills: {
        type: String,
        required: [true, 'Please Choose From - A+, A, B+, B, C+, C'],
        enum: {
            values: [
                'A+',
                'A',
                'B+',
                'B',
                'C+',
                'C',
            ],
            message: "Please Choose Any One - A+, A, B+, B, C+, C",
        }
    },
    Abot_Student: {
        type: String,
        required: true,
    },


})

module.exports = mongoose.model('Achievements', achivements)