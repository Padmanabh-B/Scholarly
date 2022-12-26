const mongoose = require('mongoose')
const AutoIncrement = require('mongoose-sequence')(mongoose);



const announceSchema = mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Admin"
    },
    announceId: {
        type: Number,
    },
    title: {
        type: String,
        required: [true, 'Please Provide The Title'],
    },
    desc: {
        type: String,
        required: [true, 'Please Provide The Description'],
    },

}, {
    timestamps : true,
});

announceSchema.plugin(AutoIncrement,{
    id:'announce_seq',
    inc_field:'announceId',
    start_seq:"001"
})



module.exports = mongoose.model("Announcement", announceSchema);