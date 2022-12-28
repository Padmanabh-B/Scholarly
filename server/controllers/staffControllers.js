const Student = require("../models/student.model")
const Marks = require("../models/marks.model")
const Attendence = require("../models/attendence.model")
const Staff = require("../models/staff.model")
const Subject = require("../models/subject.model")
const StudentNotes = require("../models/classNotes.model")
const Announcement = require('../models/announcements.model')
const Achievements = require('../models/achivements.model')
const Leave = require('../models/leave.model')
const UpcommingExam = require('../models/upExams.model')
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

//staff Logout
exports.logoutStaff = BigPromise(async (req, res, next) => {
    res.cookie('token', null, {
        expires: new Date(Date.now()),
        httpOnly: true,
    })
    res.status(200).json({
        success: true,
        message: "Logout Success"
    })
});

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
        const student = await Student.findOne({ studentClass }).populate({ path: "name" })
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

    const staffId = req.staff.id;
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
        return next(new CustomError("Please Provide The Staff Profile Picture", 404))
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

    const profile = await Staff.findByIdAndUpdate(req.profile.id, newData, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });

    res.status(200).json({
        success: true,
        message: "Staff Details Updated Successfully"
    })



});

// exports.staffLeaveMessage = BigPromise(async (req, res, next) => {
//     try {
//         const { rollNo, name, reson, leaveMessage, leavefrom, leaveto, totaldays } = req.body;
//         if (!(rollNo || name || reson || leaveMessage || leavefrom || leaveto || totaldays)) {
//             return next(new CustomError('All Fields Are requied '))
//         }
//         let rno = await Staff.findOne({ rollNo });
//         if (!rno) {
//             return next(new CustomError('No Staff Found'))
//         }

//         const staffLeave = await Leave.create({
//             rollNo,
//             name,
//             reson,
//             leaveMessage,
//             leavefrom,
//             leaveto,
//             totaldays,
//         });

//         res.status(201).json({
//             success: true,
//             message: "Leave Applied Successfully",
//             staffLeave
//         })
//     } catch (error) {
//         return next(new CustomError(`There is A Issue in Applying Leave ${error.message}`))

//     }

// })

exports.getAllAnnouncements = BigPromise(async (req, res, next) => {
    try {
        const announcements = await Announcement.find({})

        if (!announcements) {
            return next(new CustomError(`None of the Announcements Found`))
        }

        res.status(200).json({ allSubjects })
    } catch (error) {
        console.log(error);
        return next(new CustomError(`Error in Finding Announcements ${error.message}`))
    }
});

exports.approveLeave = BigPromise(async (req, res, next) => {
    try {
        const result = await Leave.findById(req.params.id);
        if (result === 0) {
            return next(new CustomError('No Leaves Found'))
        }
        const { status } = req.body;
        const getResult = await Leave.find({ status })
        if (getResult === 'pending') {
            Leave.status == status
            Leave.save()
        }


    } catch (error) {
        return next(new CustomError(`${error.message}`))

    }
})


exports.uploadStudentNotes = BigPromise(async (req, res, next) => {
    try {
        let result;
        if (!req.files) {
            return next(new CustomError("Please Provide The Notes", 404))
        }
        const file = req.files.notes;
        result = await cloudinary.uploader.upload(file.tempFilePath, {
            folder: 'Notes',
        });
        const { studentClass, section, year, subjectCode } = req.body;
        const scode = await Subject.findOne({ subjectCode })
        if (!scode) {
            return next(new CustomError("No SubjectCode Found "))
        }
        if (!(studentClass || subjectCode || section || year)) {
            return next(new CustomError('All Fields Are required'));
        }

        const upWorkNotes = await StudentNotes.create({
            studentClass,
            subjectCode,
            section,
            year,
            notes: {
                public_id: result.public_id,
                secure_url: result.secure_url,
            },
        })

        res.status(200).json({
            success: true,
            message: "Uploaded Notes Successfully",
            upWorkNotes,
        })


    } catch (error) {
        console.log(error);
        return next(new CustomError(`Error in Finding Announcements ${error.message}`))
    }
})

exports.uploadStudnetAchivements = BigPromise(async (req, res, next) => {
    const { regNo, Drawing, Emotional_SocialSkills, Organisation_Skills, Scientific_Skills, Fine_Arts, Attitudes, Creative_Skills, Moral_Skills, About_Student } = req.body;

    const rno = await Student.findOne({ regNo })

    if (!rno) {
        return next(new CustomError("Register Number Not  Found"))
    }


    if (!(regNo || Drawing || Emotional_SocialSkills || Organisation_Skills || Scientific_Skills || Fine_Arts || Attitudes || Creative_Skills || Moral_Skills || About_Student)) {
        return next(new CustomError('All Fields are Reqired'))
    }

    const assignAcment = await Achievements.create({
        regNo,
        Drawing,
        Emotional_SocialSkills,
        Organisation_Skills,
        Scientific_Skills,
        Fine_Arts, Attitudes,
        Creative_Skills,
        Moral_Skills,
        About_Student
    });


    res.status(201).json({
        success: true,
        message: "Added Successfully",
    })

})

exports.upcommingExams = BigPromise(async (req, res, next) => {
    const { studentClass, subjectCode, exam, totalMarks, date } = req.body
    if (!(studentClass || subjectCode || exam || totalMarks || date)) {
        return next(new CustomError('All Fields are required'))
    }
    if ((studentClass && subjectCode) !== Subject.find({ studentClass, subjectCode })) {
        return next(new CustomError(`${studentClass} and ${subjectCode} does't match`))
    }

    const createExam = await UpcommingExam.create({
        studentClass,
        subjectCode,
        exam,
        totalMarks,
        date
    })
    res.status(201).json({
        success: true,
        message: "Exam Created Successfully",
    })
})


exports.deleteStaffAccount = BigPromise(async (req, res, next) => {
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



