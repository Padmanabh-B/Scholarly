const express = require("express");
const router = express.Router();
const { isLoggedIn } = require("../middlewares/auth.middleware")

const { addAdmin, loginAdmin, logoutAdmin, adminForgotPassword, adminPasswordReset, displayAdminProfile, changeAdminPassword, adminAddStudent, findAllStudents, findOneStudent, addStaff, findOneStaff, findAllStaff, addSubject } = require("../controllers/adminController")

router.route("/addAdmin").post(addAdmin)
router.route("/adminLogin").post(loginAdmin)
router.route("/adminlogout").get(logoutAdmin)
router.route("/admin-password/reset").post(adminForgotPassword)
router.route("/password/reset/:token").post(adminPasswordReset)
router.route("/admin-dashboard").get(isLoggedIn, displayAdminProfile)
router.route("/admin/changepassword").post(isLoggedIn, changeAdminPassword)
router.route("/admin/add/student").post(isLoggedIn, adminAddStudent)
router.route("/admin/allStudentsList").get(isLoggedIn, findAllStudents)
router.route("/admin/student").get(isLoggedIn, findOneStudent)
router.route("/admin/add/staff").post(isLoggedIn, addStaff)
router.route("/admin/staff").get(isLoggedIn, findOneStaff)
router.route("/admin/all-staffs").get(isLoggedIn, findAllStaff)
router.route("/admin/add/subject").post(isLoggedIn, addSubject)

module.exports = router;