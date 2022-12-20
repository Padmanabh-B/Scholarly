const mongoose = require('mongoose')

const achivements = mongoose.Schema({
    student:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Student",
    }
    
})