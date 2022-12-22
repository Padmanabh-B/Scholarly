const mongoose = require('mongoose')
const validate = require("validator")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const crypto = require("crypto")
const { config } = require("../config/secret.Conifg")


const studentSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please Enter Your Name'],
        maxlength: [35, "Name Should Not Be Exceed 32 Characters"],
        minlength: [3, "Name Should Not Be Less than 3 Characters"]
    },
    email: {
        type: String,
        required: [true, 'Please Enter Your Email'],
        unique: true,
        trim: true,
    },
    panorama: {
        type: String
    },
    password: {
        type: String,
        minlength: [7, "Password Must Be 7 Characters"],
        select: false,
        required: [true, "Please Provide Password"],
    },
    year: {
        type: Number,
        required: true
    },
    subjects: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Subject'
        }
    ],
    aadharCard: {
        type: Number,
        minlength: [12, "Adhar No Must Be 12 Numbers"],

    },
    gender: {
        type: String,
        required: [true, 'Please Choose From - Boy, Girl, NONE'],
        enum: {
            values: [
                'Boy',
                'Girl',
                'NONE',
            ],
            message: "Please Choose Any One - Boy, Girl, NONE",
        }
    },
    role:{
        type:String,
        default:"student"
    },
    regNo: {
        type: String
    },
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
    section: {
        type: String,
        required: true
    },
    batch: {
        type: String,
    },
    dob: {
        type: String,
        required: true
    },
    studentMobileNumber: {
        type: Number,
        required: [true, "Please Provide Phone Number"],
        trim: true,
        unique: true,
        maxlength: [12, "Maximum Number Shhould Be Under 12 Number"],
        minlength: [10, "Minimum Length of the Phone number is 10"]
    },
    fatherMobileNumber: {
        type: Number,
        required: [true, "Please Provide Phone Number"],
        trim: true,
        unique: true,
        maxlength: [12, "Maximum Number Should Be Under 12 Number"],
        minlength: [10, "Minimum Length of the Phone number is 10"]
    },
    fatherName: {
        type: String,
        maxlength: [35, "Name Should Not Be Exceed 32 Characters"],
        minlength: [3, "Name Should Not Be Less than 3 Characters"]
    },

})

/******************************************************
 * @Encrypt_Password_Before_Save
 * @Get_PlainPassword -Encrypt it using bcrypt hashing
 *****************************************************/
studentSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    this.password = await bcrypt.hash(this.password, 10)
});

/*******************************************************
 * @Validate_Password - Comparing The Password from user password with encrypted password
 *******************************************************/

studentSchema.methods.isValidatedPassword = async function (Password) {
    return await bcrypt.compare(Password, this.password)
}

/***********************************************************
 * @Creates_and_Returns - JWT Token
 ***********************************************************/
studentSchema.methods.getJwtToken = function () {
    return jwt.sign({ id: this._id }, config.JWT_SECRET, { expiresIn: config.JWT_EXPIRY })
}

/**************************************************************
 * @Generate Forgot Password
 *************************************************************/
studentSchema.methods.getForgotPasswordToken = function () {
    //generating a long and random string

    const forgotToken = crypto.randomBytes(20).toString('hex');

    //getting a hash 
    this.forgotPasswordToken = crypto.createHash('sha256').update(forgotToken).digest('hex');

    //expiry of the token - Only 20 minutes
    this.forgotPasswordExpiry = Date.now() + 20 * 60 * 1000;
    return forgotToken;
}

module.exports = mongoose.model('Student', studentSchema)




