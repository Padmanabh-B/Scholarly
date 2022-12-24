const Student = require("../models/student.model")
const Marks = require("../models/marks.model")
const Attendence = require("../models/attendence.model")
const Staff = require("../models/staff.model")
const Subject = require("../models/subject.model")
const BigPromise = require("../middlewares/BigPromise.middleware")
const CustomError = require("../utils/CustomError")
const cookieToken = require("../utils/cookieToken")
const cloudinary = require("cloudinary").v2
const mailHelper = require("../utils/emailHelper")
const crypto = require("crypto")


// Student Login
exports.studentLogin = BigPromise(async (req, res, next) => {
    const { regNo, password } = req.body;

    if (!(regNo || password)) {
        return next(new CustomError("Regno and Password is Required"))
    }

    const profile = await Student.findOne({ regNo }).select("+password")

    if (!profile) {
        return next(new CustomError("Regno and Password Does not Match", 400))
    }
    const isPasswordCorrect = await profile.isValidatedPassword(password);
    if (!isPasswordCorrect) {
        return next(new CustomError("Email or Password does not Match", 400))
    }
    cookieToken(profile, res);
});

//Check Attendence
exports.fetchAttendence = BigPromise(async (req, res, next) => {
    try {
        const studentId = req.profile.id
        const attendence = await Attendence.find({ student: studentId }).populate('subject')
        if (!attendence) {
            return next(new CustomError(`Attendece Not Found`))
        }
        res.status(200).json({
            result: attendence.map(att => {
                let response = {};
                response.attendence = ((att.classesAttended / att.totalClassesByStaff) * 100).toFixed(2)
                response.subjectCode = att.subject.subjectCode
                response.subjectName = att.subject.subjectName
                response.maxHours = att.subject.totalLectures
                response.absentHours = att.totalClassesByStaff - att.classesAttended
                response.classesAttended = att.classesAttended
                response.totalClassesByStaff = att.totalClassesByStaff
                return response;
            })
        })
    }
    catch (error) {
        return next(new CustomError(`Error in Fetching Attendence ${error.message}`))
    }

});

//Get All students
exports.findAllStudents = BigPromise(async (req, res, next) => {
    try {
        const { department, year, section } = req.body;
        const students = await Student.find({ department, year, section })
        if (students.length === 0) {
            return res.status(400).json({ message: "No Student found" })
        }
        return res.status(200).json({ result: students })
    } catch (error) {

    }
});

//Get One Student
exports.getStudentByName = BigPromise(async (req, res, next) => {
    try {
        const { name } = req.body.name;
        const student = await Student.find({ name })
        if (student.length === 0) {
            return next(new CustomError("No Student Found"))
        }
        return res.status(201).json({
            result: student
        })

    } catch (error) {
        return next(new CustomError(`Error in Fetcing Student ${error.message}`))

    }
});

//Update Password if Student is logged In
exports.changeStudentPassword = BigPromise(async (req, res, next) => {

    const studentId = req.studnet.id;
    const profile = await Student.findById(studentId).select("+password")

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


//Forgot Password
exports.studentForgotPassword = BigPromise(async (req, res, next) => {
    const { email } = req.body;

    const studnet = await Student.findOne({ email });

    if (!studnet) {
        return next(new CustomError("Email not found as Registered"));
    }

    //get token from profile models
    const forgotToken = await studnet.getForgotPasswordToken();
    //not check everthing just save everything
    await studnet.save({ validateBeforeSave: true })

    //create a URL
    const myUrl = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${forgotToken}`
    //crafting message
    const message = `Copy Paste this link in your URL and hit enter \n\n ${myUrl}`;

    //attempt to send mail
    try {

        await mailHelper({
            email: studnet.email,
            subject: "Scholary - Password reset email",
            message,
        })

        res.status(200).json({
            success: true,
            message: `Email Sent SuccessFull To ${email} - It Is Valid Only For 20 min`
        })


    } catch (error) {
        studnet.forgotPasswordToken = undefined,
            studnet.forgotPasswordExpiry = undefined,
            await studnet.save({ validateBeforeSave: false })

        return next(new CustomError(error.message, 500))
    }
});

//Reset Password Through Mail
exports.studentPasswordReset = BigPromise(async (req, res, next) => {

    //grab token from params
    const token = req.params.token;

    //Encrypt token
    const encryToken = crypto.createHash('sha256').update(token).digest('hex');

    //  @Find_One = check the encrypted token and date of expire that is greaten than now

    const profile = await Student.findOne({
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

//Update Student Profile
exports.updateStaffProfile = BigPromise(async (req, res, next) => {
    let result;
    if (!req.files) {
        return next(new CustomError("Please Provide The Staff Profile Picture", 404))
    }
    const file = req.files.photo;
    result = await cloudinary.uploader.upload(file.tempFilePath, {
        folder: 'Student',
        width: 300,
        crop: "scale",
    });
    const {
        fatherName, address
    } = req.body;

    const newData = {
        fatherName,
        address,
        photo: {
            public_id: result.public_id,
            secure_url: result.secure_url,
        },
    }

    const profile = await Student.findByIdAndUpdate(req.profile.id, newData, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });

    res.status(200).json({
        success: true,
        message: "Staff Details Updated Successfully"
    })



});

exports.getMarks = BigPromise(async (req, res, next) => {
    try {
        const { studentClass, section, exam, } = req.body;
        const student = await Marks.find({ studentClass, section, exam })
        if (!student) {
            return next(new CustomError(`There is No Student Found ${error.message}`))
        }
        res.send(student)


    } catch (error) {
        return next(new CustomError(`Error In Fetching Marks ${error.message}`))
    }
});

exports.findAllSubjects = BigPromise(async (req, res, next) => {
    const { studentClass, year } = req.body;

    const subjects = await Subject.find({ studentClass, year })
    if (!subjects) {
        return next(new CustomError(`${studentClass} and ${year} are not Matching`))
    }
    res.send(201).json({ result: subjects })
})



