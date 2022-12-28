const mongoose = require('mongoose')

const achivementSchema = mongoose.Schema({
    regNo: {
        type: String,
        requied: true,
        unique: [true, 'Its Already added']
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
    About_Student: {
        type: String,
        required: true,
    },


})

module.exports = mongoose.model('Achievements', achivementSchema)