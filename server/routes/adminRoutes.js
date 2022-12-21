const express = require("express");
const router = express.Router();

const { addAdmin, loginAdmin, logoutAdmin, adminForgotPassword, adminPasswordReset, displayAdminProfile, changeAdminPassword } = require("../controllers/adminController")

router.route("/addAdmin").post(addAdmin)
router.route("/adminLogin").post(loginAdmin)
router.route("/adminlogout").get(logoutAdmin)
router.route("/admin-password/reset").post(adminForgotPassword)
router.route("/password/reset/:token").post(adminPasswordReset)
router.route("/admin-dashboard/:id").get(displayAdminProfile)
router.route("/admin/changepassword").post(changeAdminPassword)

module.exports = router;