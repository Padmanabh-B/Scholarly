const Admin = require('../models/admin.model')
const Student = require("../models/student.model")
const Staff = require("../models/staff.model")
const Subject = require("../models/subject.model")
const Announcement = require('../models/announcements.model')
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

//Admin add students
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

        const students = await Student.find({ studentClass })
        let increment;
        if (students.length < 10) {
            increment = "00" + students.length.toString()
        }
        else if (students.length < 100 && students.length > 9) {
            increment = "0" + students.length.toString();
        }
        else {
            increment = students.length.toString()
        }
        let date = new Date();

        const generateStudentRegNo = [
            "SDT",
            date.getFullYear(),
            studentClass,
            increment,
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
        await profile.save()
        const sub = await Subject.find({ year });
        if (sub.length !== 0) {
            for (var i = 0; i < sub.length; i++) {
                Student.subjects?.push(sub[i]._id)
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

        console.log(error)
        res.status(401).json({
            success: false,
            message: `Error in Adding New Student ${error.message}`
        })
    }

})


exports.adminDeleteOneStaff = BigPromise(async (req, res, next) => {
    const staff = await Staff.findById(req.params.id);

    if (!staff) {
        return next(new CustomError(`${staff} - No User Found From This Name`))
    }
    const imageId = staff.photo.public_id;
    await cloudinary.uploader.destroy(imageId)

    await staff.remove()
    res.status(201).json({
        success: true,
    })
});

exports.adminDeleteOneStudent = BigPromise(async (req, res, next) => {
    const student = await Student.findById(req.params.id);

    if (!student) {
        return next(new CustomError(`${student} - No User Found From This Name`))
    }
    const imageId = student.photo.public_id;
    await cloudinary.uploader.destroy(imageId)

    await student.remove()
    res.status(201).json({
        success: true,
    })
});

//admin get all students
exports.findAllStudents = BigPromise(async (req, res, next) => {
    try {
        const { studentClass, name } = req.body;
        const students = await Student.find({});

        if (!students) {
            return next(new CustomError("No Students Found", 400))
        }
        res.status(200).json({
            success: true,
            students
        })
    } catch (error) {
        return next(new CustomError(`${error}`, 400))
    }
})

//find Student Based on Class and Year
exports.findOneStudent = BigPromise(async (req, res, next) => {
    try {
        const { studentClass, year } = req.body;
        const student = await Student.find({ studentClass, year })

        if (!student) {
            return next(new CustomError("No Students Found", 400))
        }
        res.status(200).json({
            success: true,
            student
        })
    } catch (error) {
        return next(new CustomError(`${error}`, 400))
    }
})


//Add Staff 
exports.addStaff = BigPromise(async (req, res, next) => {
    try {
        const { name, email, password, designation, Staffclass, year, aadharCard, gender, dob, staffcontactNo } = req.body;

        if (!(name || email || password || designation || Staffclass || year || aadharCard || gender || dob || staffcontactNo)) {
            return next(new CustomError("All Fields Are Required"))
        }

        const staff = await Staff.find({ email });

        if (!staff) {
            return next(new CustomError("Email is Not Registerd"))
        }
        let date = new Date();

        const generateStudentRegNo = [
            "STAFF",
            date.getFullYear(),
            Staffclass,
        ];
        let regNo = generateStudentRegNo.join("")


        const profile = await Staff.create({
            regNo,
            name,
            email,
            password,
            designation,
            Staffclass,
            year,
            aadharCard,
            gender,
            dob,
            staffcontactNo,
        });
        profile.password = undefined;
        res.status(201).json({
            success: true,
            message: `Hello ${name} Your Account Created Successfully`,
            profile,
        });


    } catch (error) {
        console.log(error);
        res.status(401).json({
            success: false,
            message: `Error in Adding New Student ${error.message}`
        })
    }
})

//admin get all Staff
exports.findAllStaff = BigPromise(async (req, res, next) => {
    try {
        const staff = await Staff.find({});

        if (!staff) {
            return next(new CustomError("No Staff Found", 400))
        }
        res.status(200).json({
            success: true,
            staff
        })
    } catch (error) {
        return next(new CustomError(`${error}`, 400))
    }
})


//find Student Based on Class and Year
exports.findOneStaff = BigPromise(async (req, res, next) => {
    try {
        const { Staffclass, year } = req.body;
        const staff = await Staff.find({ Staffclass, year })

        if (!staff) {
            return next(new CustomError("No Students Found", 400))
        }

        res.status(200).json({
            success: true,
            staff
        })
    } catch (error) {
        return next(new CustomError(`${error}`, 400))
    }
})


//add Subjects
exports.addSubject = BigPromise(async (req, res, next) => {
    try {
        const { totalClasses, studentClass, subjectCode, subjectName, year } = req.body;

        if (!(totalClasses || studentClass || subjectCode || subjectName || year)) {
            return next(new CustomError("All Fields Are required"))
        }
        const subject = await Subject.findOne({ subjectCode });
        if (subject) {
            return next(new CustomError("This Subject Code is Already Added"))
        }
        const newSubject = await Subject.create({
            totalClasses,
            studentClass,
            subjectCode,
            subjectName,
            year
        });

        res.status(200).json({
            success: true,
            message: `${subjectName} is Added Successfully`
        })

        const students = await Student.find({ studentClass, year })
        if (students.length === 0) {
            return next(new CustomError("No Students Found"))
            return res.status(400).json(errors)
        }
        else {
            for (var i = 0; i < students.length; i++) {
                students[i].subjects.push(newSubject._id)
                await students[i].save()
            }
            res.status(200).json({ newSubject })
        }


    } catch (error) {
        return next(new CustomError(`Error In Adding New Subject, ${error.message}`))
    }

});

exports.announceEvent = BigPromise(async (req, res, next) => {
    const { title, desc } = req.body;

    if (!(title && desc)) {
        return next(new CustomError('Title and Description in Mandatory'))
    }

    const newAncment = await Announcement.create({
        title,
        desc
    });

    res.status(201).json({
        success: true,
        message: "Announcement Added",
        newAncment
    })


})


