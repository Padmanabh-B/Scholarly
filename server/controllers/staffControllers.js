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

//Staff Controlles

//login staff
exports.staffLogin = BigPromise(async (req, res, next) => {
    const { regNo, password } = req.body;

    if (!(regNo || password)) {
        return next(new CustomError("Regno and Password is Required"))
    }

    const profile = await Staff.findOne({ regNo }).select("+password")

    if (!profile) {
        return next(new CustomError("Regno and Password Does not Match", 400))
    }
    const isPasswordCorrect = await profile.isValidatedPassword(password);
    if (!isPasswordCorrect) {
        return next(new CustomError("Email or Password does not Match", 400))
    }
    cookieToken(profile, res);
})

// Get Students with Subjects
exports.fetchStudents = BigPromise(async (req, res, next) => {
    try {
        const { studentClass, year, section } = req.body;
        if (!(studentClass || year || section)) {
            return next(new CustomError("All Fields are required"))
        }
        const subList = await Subject.find({ studentClass, year })
        if (subList.length === 0) {
            return next(new CustomError("No Subject Found in This Class"))
        }
        const students = await Student.find({ studentClass, year, section })
        if (students.length === 0) {
            return next(new CustomError("No Student Found"))
        }
        res.status(201).json({
            result: students.map(stud => {
                var stud = {
                    _id: stud._id,
                    regNo: stud.regNo,
                    name: stud.name
                }
                return stud;
            }),
            subjectCode: subList.map(sub => {
                return sub.subjectCode;
            })
        })
    } catch (error) {
        console.log(error);
        return next(new CustomError(`Error In Fetching Faculty ${error.message}`))
    }
})

//Give Attendence
exports.makeAttendence = BigPromise(async (req, res, next) => {
    try {
        const { selectStudents, subjectCode, studentClass, year } = req.body;
        const sub = await Subject.findOne({ subjectCode });

        //All Students
        const getAllStudents = await Student.find({ studentClass, year, section })

        let sortStudents = getAllStudents.filter(function (item) {
            return selectStudents.indexOf(item.id) === -1;
        })

        //Who Does not Attendence
        for (let i = 0; i < sortStudents.length; i++) {
            const pre = await Attendence.findOne({ student: sortStudents[i]._id, subject: sub.id });
            if (!pre) {
                const attendence = new Attendence({
                    student: sortStudents[i],
                    subject: sub._id
                })
                attendence.totalClassesByStaff += 1
                await attendence.save();
            }
            else {
                pre.totalClassesByStaff += 1
                await pre.save()
            }
        }
        for (let att = 0; att < selectStudents.length; att++) {
            const pre = await Attendence.findOne({
                student: selectStudents[att],
                subject: sub._id
            })
            if (!pre) {
                const attendence = new Attendence({
                    student: selectStudents[att],
                    subject: sub._id
                })
                attendence.totalLecturesByStaff += 1
                attendence.classesAttended += 1
                await attendence.save()
            }
            else {
                pre.totalLecturesByStaff += 1
                pre.classesAttended += 1
                await pre.save()
            }
            res.status(201).json({
                success: true,
                message: "Attendece Applied Successfully"
            })
        }
    } catch (error) {
        console.log("error", err.message)
        return next(new CustomError(`Error In Giving Attendence ${error.message}`));
    }
});

//Give Marks To Students
exports.uploadMarksForStudents = BigPromise(async (req, res, next) => {
    try {
        const { subjectCode, exam, totalMarks, marks, studentClass, year, section } = req.body;
        if (!(subjectCode || exam || totalMarks || marks || studentClass || year || section)) {
            return next(new CustomError("All Fields are required"))
        }
        const subject = await Subject.findOne({ subjectCode })
        const student = await Student.findOne({ studentClass })
        if (!subject) {
            return next(new CustomError(`${subjectCode} Subject Code Not Valid One`))
        }
        if (!student) {
            return next(new CustomError(`${studentClass} Subject Class Not Valid One`))
        }

        const ifAssigned = await Marks.find({ exam, studentClass, section, subjectCode: subject._id })
        if (ifAssigned.length !== 0) {
            return next(new CustomError("You Are Already Assigned the Marks For This Exam"))
        }

        if (marks < 0 || marks > totalMarks) {
            return next(new CustomError("You are Entering Wrong Marks"))
        }

        const newMarks = await Marks.create({
            student: student._id,
            subject: subject._id,
            exam,
            studentClass,
            section,
            year,
            marks,
            totalMarks
        })

        res.status(201).json({
            success: true,
            message: "Marks Uploaded Successfully",
        })
    } catch (error) {
        console.log(error);
        return next(new CustomError(`Error in Uploading Marks ${error}`))
    }
})


//Fetch All Subjects
exports.getAllSubject = BigPromise(async (req, res, next) => {
    try {
        const allSubjects = await Subject.find({})
        if (!allSubjects) {
            return next(new CustomError("Subjects Not Found"))
        }
        res.status(200).json({ allSubjects })

    } catch (error) {
        return next(new CustomError(`Problem in Fetching The Subjects..! Error Found ${error.message}`));
    }
});

//Change Password Of Staff if Staff is Logged In
exports.changeStaffPassword = BigPromise(async (req, res, next) => {

    const staffId = req.profile.id;
    const profile = await Staff.findById(staffId).select("+password")

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
exports.staffForgotPassword = BigPromise(async (req, res, next) => {
    const { email } = req.body;

    const staff = await Staff.findOne({ email });

    if (!staff) {
        return next(new CustomError("Email not found as Registered"));
    }

    //get token from profile models
    const forgotToken = await admin.getForgotPasswordToken();
    //not check everthing just save everything
    await staff.save({ validateBeforeSave: true })

    //create a URL
    const myUrl = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${forgotToken}`
    //crafting message
    const message = `Copy Paste this link in your URL and hit enter \n\n ${myUrl}`;

    //attempt to send mail
    try {

        await mailHelper({
            email: staff.email,
            subject: "Scholary - Password reset email",
            message,
        })

        res.status(200).json({
            success: true,
            message: `Email Sent SuccessFull To ${email} - It Is Valid Only For 20 min`
        })


    } catch (error) {
        staff.forgotPasswordToken = undefined,
            staff.forgotPasswordExpiry = undefined,
            await staff.save({ validateBeforeSave: false })

        return next(new CustomError(error.message, 500))
    }
})

//Reset Password Through Mail
exports.staffPasswordReset = BigPromise(async (req, res, next) => {

    //grab token from params
    const token = req.params.token;

    //Encrypt token
    const encryToken = crypto.createHash('sha256').update(token).digest('hex');

    //  @Find_One = check the encrypted token and date of expire that is greaten than now

    const profile = await Staff.findOne({
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

exports.updateStaffProfile = BigPromise(async (req, res, next) => {
    let result;
    if (!req.files) {
        return next(new CustomError("Photo is Required For Signup", 404))
    }
    const file = req.files.photo;
    result = await cloudinary.uploader.upload(file.tempFilePath, {
        folder: 'Staffs',
        width: 300,
        crop: "scale",
    });
    const {
        Staffclass, address, teachingSubjects
    } = req.body;

    const newData = {
        Staffclass,
        address,
        teachingSubjects,
        photo: {
            public_id: result.public_id,
            secure_url: result.secure_url,
        },
    }

    const staff = await Staff.findByIdAndUpdate(req.params.id, newData, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });

    res.status(200).json({
        success: true,
        message: "Staff Details Updated Successfully"
    })



});

