const express = require("express");
const router = express.Router();
const { isStaffLoggedIn } = require("../middlewares/staffauth.middleware")
const { isLoggedIn } = require("../middlewares/auth.middleware")

const {
    staffLogin,
    logoutStaff,
    fetchStudents,
    makeAttendence,
    uploadMarksForStudents,
    getAllSubject,
    changeStaffPassword,
    staffForgotPassword,
    staffPasswordReset,
    updateStaffProfile,
    getAllAnnouncements,
    uploadStudentNotes,
    deleteStaffAccount
} = require("../controllers/staffControllers")

router.route("/staff/login").post(staffLogin);
router.route("/staff/logout").get(logoutStaff);
router.route("/staff/fetchstudents").post(isLoggedIn, fetchStudents);
router.route("/staff/assign-attendence").post(makeAttendence);
router.route("/staff/upload/student-marks").post(isLoggedIn, uploadMarksForStudents);
router.route("/staff/subjects/allsubjects").get(isLoggedIn, getAllSubject);
router.route("/staff/profile/changepassword").post(isStaffLoggedIn, changeStaffPassword);
router.route("/staff/forgotpassword/").post(staffForgotPassword);
router.route("/staff/password/reset/:token/").post(staffPasswordReset);
router.route("/staff/profile/update-profile").post(isLoggedIn, updateStaffProfile);
router.route("/staff/announcmenets").get(isLoggedIn, getAllAnnouncements);
router.route("/staff/notes/upload").post(isLoggedIn, uploadStudentNotes);
router.route("/staff/profile/delete/:id").post(isLoggedIn, deleteStaffAccount);


module.exports = router;