const cookieParser = require("cookie-parser");
const express = require("express");
const morgan = require("morgan")
const fileUpload = require("express-fileupload");

const app = express()

//Express Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/"
}))


/** @MORGAN MIDDLEWARE */
app.use(morgan("tiny"))


//All Routes Goes Here
const admin = require("./routes/adminRoutes")
const staff = require("./routes/staffRoutes")
const student = require("./routes/studentRoutes")

// * Router * //
app.use("/api/v1", admin)
app.use("/api/v1", staff)
app.use("/api/v1", student)


app.get("/", (req, res) => {
    res.send("Hello Academy Administrator")
})


module.exports = app;