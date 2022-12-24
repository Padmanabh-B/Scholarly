const express = require("express");
const router = express.Router();
const { isLoggedIn } = require("../middlewares/auth.middleware")
const { studentLogin, getMarks, studentForgotPassword, studentPasswordReset } = require("../controllers/studentControllers")



router.route("/student/login").post(studentLogin);
router.route("/student/get-marks").get(isLoggedIn, getMarks);
router.route("/student/forgotpassword").post(studentForgotPassword);
router.route("/student/password/reset/:token").post(studentPasswordReset);


module.exports = router;