const mongoose = require('mongoose')

const feedbackSchema = mongoose.Schema({
    feedbackMessage: {
        type: String,
        required: true,
    }
}, {
    timestamp: true,
}
)

module.exports = mongoose.model('FeedBack', feedbackSchema)
