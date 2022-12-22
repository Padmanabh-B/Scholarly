const Admin = require('../models/admin.model')
const Student = require("../models/student.model")
// const Staff = require("../models/staff.model")
const Subject = require("../models/subject.model")
const BigPromise = require("../middlewares/BigPromise.middleware")
const CustomError = require("../utils/CustomError")
const cookieToken = require("../utils/cookieToken")
const cloudinary = require("cloudinary").v2
const mailHelper = require("../utils/emailHelper")
const crypto = require("crypto")




//All Admin Routes
//Add Admin
exports.addAdmin = BigPromise(async (req, res, next) => {

    let result;
    if (!req.files) {
        return next(new CustomError("Photo is Required For Signup", 404))
    }

    const { name, email, contactNo, dob, password } = req.body;
    if (!(name || email || contactNo || dob || password)) {
        return next(new CustomError("All Fields Are Required"));
    }

    if (await Admin.findOne({ email, contactNo }) == req.body) {
        return next(new CustomError("Email Id, Contact No is Already Registered"))
    }

    const file = req.files.photo;
    result = await cloudinary.uploader.upload(file.tempFilePath, {
        folder: 'Admins',
        width: 300,
        crop: "scale",
    });


    const date = new Date();
    const generateAdminRegNo = [
        "ADMIN",
        date.getFullYear(),
        name
    ];
    let regNo = generateAdminRegNo.join("")

    const profile = await Admin.create({
        name,
        email,
        password,
        regNo,
        role: "admin",
        contactNo,
        dob,
        photo: {
            public_id: result.public_id,
            secure_url: result.secure_url,
        },
    });

    cookieToken(profile, res);
});


//Login Admin
exports.loginAdmin = BigPromise(async (req, res, next) => {
    const { regNo, password } = req.body;

    if (!(regNo || password)) {
        return next(new CustomError("Regno and Password is Required"))
    }

    const profile = await Admin.findOne({ regNo }).select("+password")

    if (!profile) {
        return next(new CustomError("Regno and Password Does not Match", 400))
    }
    const isPasswordCorrect = await profile.isValidatedPassword(password);
    if (!isPasswordCorrect) {
        return next(new CustomError("Email or Password does not Match", 400))
    }
    cookieToken(profile, res);
})

//logout
exports.logoutAdmin = BigPromise(async (req, res, next) => {
    res.cookie('token', null, {
        expires: new Date(Date.now()),
        httpOnly: true,
    })
    res.status(200).json({
        success: true,
        message: "Logout Success"
    })
});

//Forgot Password
exports.adminForgotPassword = BigPromise(async (req, res, next) => {
    const { email } = req.body;

    const admin = await Admin.findOne({ email });

    if (!admin) {
        return next(new CustomError("Email not found as Registered"));
    }

    //get token from profile models
    const forgotToken = await admin.getForgotPasswordToken();
    //not check everthing just save everything
    await admin.save({ validateBeforeSave: true })

    //create a URL
    const myUrl = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${forgotToken}`
    //crafting message
    const message = `Copy Paste this link in your URL and hit enter \n\n ${myUrl}`;

    //attempt to send mail
    try {

        await mailHelper({
            email: admin.email,
            subject: "Scholary - Password reset email",
            message,
        })

        res.status(200).json({
            success: true,
            message: `Email Sent SuccessFull To ${email} - It Is Valid Only For 20 min`
        })


    } catch (error) {
        admin.forgotPasswordToken = undefined,
            admin.forgotPasswordExpiry = undefined,
            await admin.save({ validateBeforeSave: false })

        return next(new CustomError(error.message, 500))
    }
})

//Reset Password Through Mail
exports.adminPasswordReset = BigPromise(async (req, res, next) => {

    //grab token from params
    const token = req.params.token;

    //Encrypt token
    const encryToken = crypto.createHash('sha256').update(token).digest('hex');

    //  @Find_One = check the encrypted token and date of expire that is greaten than now

    const profile = await Admin.findOne({
        forgotPasswordToken: encryToken,
        forgotPasswordExpiry: {
            $gt: Date.now()
        }
    });

    // if profile Not found throw error
    if (!profile) {
        return next(new CustomError("Token is Invalid or Expired", 400))
    }

    // if password and confirm password doesnot match throw error
    if (req.body.password !== req.body.confirmPassword) {
        return next(new CustomError("Password is Confirm Password is don't match", 400))
    }


    // if all ok assign old password to new password and also clear the forgorPasswordToken
    // and forgotPasswordExpiry

    profile.password = req.body.password;
    profile.forgotPasswordToken = undefined;
    profile.forgotPasswordExpiry = undefined;


    //At last save with new values that is password
    await profile.save();

    // send json response or send token

    cookieToken(profile, res);

});

//display Profile
exports.displayAdminProfile = BigPromise(async (req, res) => {
    const profile = await Admin.findById(req.profile.id)
    res.status(201).json({
        success: true,
        profile,
    })
});

//Change Password When Logged In
exports.changeAdminPassword = BigPromise(async (req, res, next) => {

    const adminId = req.profile.id;
    const profile = await Admin.findById(adminId).select("+password")

    const isCorrectOldPassword = await profile.isValidatedPassword(req.body.oldPassword)

    if (!isCorrectOldPassword) {
        return next(new CustomError("Old Password is incorrect", 400));
    }

    profile.password = req.body.password;
    await profile.save()

    //update the cookie
    res.status(200).json({
        success: true,
        message: "Password Changed Successfully"
    })
    cookieToken(profile, res);
});

exports.adminAddStudent = BigPromise(async (req, res, next) => {
    try {
        const { name, email, password, studentClass, year, aadharCard, gender, section, dob, studentMobileNumber, fatherMobileNumber } = req.body;

        if (!(name || email || password || studentClass || year || aadharCard || gender || section || dob || studentMobileNumber || fatherMobileNumber)) {
            return next(new CustomError("All Fields Are Required"))
        }

        // res.stats(401).json({
        //     success: false,
        //     message: "All Fields Are Required"
        // })

        const student = await Student.find({ email });

        if (!student) {
            return next(new CustomError("Email  is Not Registerd"))
        }

        let date = new Date();

        const generateStudentRegNo = [
            "STUDENT",
            date.getFullYear(),
            studentClass,
        ];
        let regNo = generateStudentRegNo.join("")


        const profile = await new Student({
            regNo,
            name,
            email,
            password,
            studentClass,
            year,
            aadharCard,
            gender,
            section,
            dob,
            studentMobileNumber,
            fatherMobileNumber
        });
        const subjects = await Subject.find({ year })
        if (subjects.length !== 0) {
            for (var i = 0; i < subjects.length; i++) {
                Student.subjects.push(subjects[i]._id)
            }
        }
        await profile.save()
        profile.password = undefined;

        res.status(201).json({
            success: true,
            message: `Hello ${name} Your Account Created Successfully`,
            profile,
        });


    } catch (error) {
        res.status(401).json({
            success: false,
            message: `Error in Adding New Student ${error.message}`
        })
    }

})

exports.findAllStudents = BigPromise(async (req, res, next) => {
    
})