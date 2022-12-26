const mongoose = require('mongoose')


const classNotes = mongoose.Schema({
    studentClass: {
        type: String,
        required: true,
        enum: {
            values: [
                '06',
                '07',
                '08',
                '09',
                '10',
            ],
            message: "Please Choose Any One - 06,07,08,09,10",
        }
    },
    subjectCode: {
        type: String,
        require: [true, 'Please Pro vide Subject Code']
    },
    section: {
        type: String,
        require: [true, 'Section Is Mandatory']
    },
    notes: {
        public_id: {
            type: String,
        },
        secure_url: {
            type: String,
        }
    },
    year: {
        type: String,
    },

})

module.exports = mongoose.model("StudentNotes", classNotes);
