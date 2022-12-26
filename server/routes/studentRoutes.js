const express = require("express");
const router = express.Router();
const { isLoggedIn } = require("../middlewares/auth.middleware")
const { studentLogin, getMarks, studentForgotPassword, studentPasswordReset, deleteStudentAccount ,fetchAttendence,findAllStudents,findAllSubjects,changeStudentPassword,getStudentByName} = require("../controllers/studentControllers")



router.route("/student/login").post(studentLogin);
router.route("/student/get-marks").get(isLoggedIn, getMarks);
router.route("/student/fetchAttendence").get(isLoggedIn, fetchAttendence); 
router.route("/student/find/allstudents").get(isLoggedIn, findAllStudents); 
router.route("/student/find/allsubjects").get(isLoggedIn, findAllSubjects); 
router.route("/student/find/student").get(isLoggedIn, getStudentByName); 
router.route("/student/forgotPassword").post(studentForgotPassword); 
router.route("/student/profile/change-password").post(changeStudentPassword);
router.route("/student/password/reset/:token").post(studentPasswordReset);
router.route("/staff/profile/delete-account/:id").post(isLoggedIn, deleteStudentAccount);



module.exports = router;