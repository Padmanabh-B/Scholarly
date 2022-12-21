const express = require("express");
const router = express.Router();

const { addAdmin, loginAdmin, logoutAdmin } = require("../controllers/adminController")

router.route("/addAdmin").post(addAdmin)
router.route("/adminLogin").post(loginAdmin)
router.route("/adminlogout").get(logoutAdmin)

module.exports = router;