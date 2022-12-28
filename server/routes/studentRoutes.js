const express = require("express");
const router = express.Router();
const { isLoggedIn } = require("../middlewares/auth.middleware")
const { studentLogin, getMarks, studentForgotPassword, studentPasswordReset, deleteStudentAccount, fetchAttendence, findAllStudents,  changeStudentPassword, getStudentByName, getAchivements, studentLeaveMessage,studentFeedbackMessage } = require("../controllers/studentControllers")



router.route("/student/login").post(studentLogin);
router.route("/student/get-marks").get(isLoggedIn, getMarks);
router.route("/student/fetchAttendence").get(isLoggedIn, fetchAttendence);
router.route("/student/find/allstudents").get(isLoggedIn, findAllStudents);
router.route("/student/find/student").get(isLoggedIn, getStudentByName);
router.route("/student/fetch/achivements/:id").get(isLoggedIn, getAchivements);
router.route("/student/apply/leave").post(isLoggedIn, studentLeaveMessage);
router.route("/student/apply/feedback").post(isLoggedIn, studentFeedbackMessage);
router.route("/student/forgotPassword").post(isLoggedIn, studentForgotPassword);
router.route("/student/password/reset/:token").post(studentPasswordReset);
router.route("/student/profile/change-password").post(isLoggedIn, changeStudentPassword);
router.route("/staff/profile/delete-account/:id").post(isLoggedIn, deleteStudentAccount);



module.exports = router;