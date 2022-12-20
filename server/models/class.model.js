const mongoose = require('mongoose')


const classSchema = mongoose.Schema({
    classCode:{
        type:Number,
    },
    className:{
        type:String,
        unique:true,
    },
    year:{
        type:String,
    },

})

module.exports = mongoose.model("Class", classSchema);
