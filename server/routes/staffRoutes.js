const express = require("express");
const router = express.Router();
const { isLoggedIn } = require("../middlewares/auth.middleware")

const {
    staffLogin,
    fetchStudents,
    makeAttendence,
    uploadMarksForStudents,
    getAllSubject,
    changeStaffPassword,
    staffForgotPassword,
    staffPasswordReset,
    updateStaffProfile
} = require("../controllers/staffControllers")

router.route("/stafflogin").post(staffLogin);
router.route("/staff/fetchstudents").post(isLoggedIn, fetchStudents);
router.route("/staff/assign-attendence").post(makeAttendence);
router.route("/staff/upload/student-marks").post(isLoggedIn, uploadMarksForStudents);
router.route("/staff/subjects/allsubjects").get(isLoggedIn, getAllSubject);
router.route("/staff/profile/changepassword").post(isLoggedIn, changeStaffPassword);
router.route("/staff/forgotpassword/").post(staffForgotPassword);
router.route("/staff/password/reset/:token/").post(staffPasswordReset);
router.route("/staff/profile/update-profile").post(isLoggedIn, updateStaffProfile);


module.exports = router;