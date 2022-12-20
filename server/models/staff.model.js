const mongoose = require('mongoose')
const validate = require("validator")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const crypto = require("crypto")
const { config } = require("../config/secret.Conifg")


const staffSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please Enter Your Name'],
        maxlength: [35, "Name Should Not Be Exceed 32 Characters"],
        minlength: [3, "Name Should Not Be Less than 3 Characters"]
    },
    email: {
        type: String,
        required: [validate.isEmail, 'Please Enter Your Email'],
        unique: true,
        trim: true,
    },
    password: {
        type: String,
        minlength: [7, "Password Must Be 7 Characters"],
        select: false,
    },
    designation: {
        type: String,
        required: true
    },
    class: {
        type: String,
        required: true
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
    regNo: {
        type: String,
    },
    photo: {
        public_id: {
            type: String,
        },
        secure_url: {
            type: String,
        }
    },
    address: {
        type: String,
        required: [true, "Please Provide Address"],
    },
    class: {
        type: String,
    },
    dob: {
        type: String,
    },
    joiningYear: {
        type: String,
    },
    aadharCard: {
        type: Number
    },
    teachingSubjects: [{
        type: String
    }],
    panorama: {
        type: String,
    },
    staffcontactNo: {
        type: Number,
        required: [true, "Please Provide Phone Number"],
        trim: true,
        unique: true,
        maxlength: [12, "Maximum Number Shhould Be Under 12 Number"],
        minlength: [10, "Minimum Length of the Phone number is 10"]
    },
    forgotPasswordToken: String,
    forgotPasswordExpiry: Date,

},
    {
        timestamp: true,
    }
)


/******************************************************
 * @Encrypt_Password_Before_Save
 * @Get_PlainPassword -Encrypt it using bcrypt hashing
 *****************************************************/
staffSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    this.password = await bcrypt.hash(this.password, 10)
});

/*******************************************************
 * @Validate_Password - Comparing The Password from user password with encrypted password
 *******************************************************/

staffSchema.methods.isValidatedPassword = async function (staffPassword) {
    return await bcrypt.compare(staffPassword, this.password)
}

/***********************************************************
 * @Creates_and_Returns - JWT Token
 ***********************************************************/
staffSchema.methods.getStaffJwtToken = function () {
    return jwt.sign({ id: this._id }, config.JWT_SECRET, { expiresIn: config.JWT_EXPIRY })
}

/**************************************************************
 * @Generate Forgot Password
 *************************************************************/
staffSchema.methods.getStaffForgotPasswordToken = function () {
    //generating a long and random string

    const forgotStaffToken = crypto.randomBytes(20).toString('hex');

    //getting a hash 
    this.forgotPasswordToken = crypto.createHash('sha256').update(forgotStaffToken).digest('hex');

    //expiry of the token - Only 20 minutes
    this.forgotPasswordExpiry = Date.now() + 20 * 60 * 1000;
    return forgotStaffToken;
}

module.exports = mongoose.model("Staff", staffSchema);