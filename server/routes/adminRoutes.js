const express = require("express");
const router = express.Router();
const { isLoggedIn } = require("../middlewares/auth.middleware")

const { addAdmin, loginAdmin, logoutAdmin, adminForgotPassword, adminPasswordReset, displayAdminProfile, changeAdminPassword,adminAddStudent } = require("../controllers/adminController")

router.route("/addAdmin").post(addAdmin)
router.route("/adminLogin").post(loginAdmin)
router.route("/adminlogout").get(logoutAdmin)
router.route("/admin-password/reset").post(adminForgotPassword)
router.route("/password/reset/:token").post(adminPasswordReset)
router.route("/admin-dashboard").get(isLoggedIn, displayAdminProfile)
router.route("/admin/changepassword").post(isLoggedIn, changeAdminPassword)
router.route("/admin/add/student").post(isLoggedIn, adminAddStudent)

module.exports = router;