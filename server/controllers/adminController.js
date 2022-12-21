const Admin = require('../models/admin.model')
const BigPromise = require("../middlewares/BigPromise.middleware")
const CustomError = require("../utils/CustomError")
const cookieToken = require("../utils/cookieToken")
const cloudinary = require("cloudinary").v2



//Add Admin
exports.addAdmin = BigPromise(async (req, res, next) => {

    let result;
    if (!req.files) {
        return next(new CustomError("Photo is Required For Signup", 404))
    }

    const { name, email, contactNo, dob, password } = req.body;
    if (!(name || email || contactNo || dob || password)) {
        return next(new CustomError("All Fields Are Required"));
    }

    if (await Admin.findOne({ email, contactNo }) == req.body) {
        return next(new CustomError("Email Id, Contact No is Already Registered"))
    }

    const file = req.files.photo;
    result = await cloudinary.uploader.upload(file.tempFilePath, {
        folder: 'Admins',
        width: 300,
        crop: "scale",
    });


    const date = new Date();
    const generateAdminRegNo = [
        "ADMIN",
        date.getFullYear(),
        name
    ];
    let regNo = generateAdminRegNo.join("")

    const user = await Admin.create({
        name,
        email,
        password,
        regNo,
        contactNo,
        dob,
        photo: {
            public_id: result.public_id,
            secure_url: result.secure_url,
        },
    });

    cookieToken(user, res);
});


//Login Admin
exports.loginAdmin = BigPromise(async (req, res, next) => {
    const { regNo, password } = req.body;

    if (!(regNo || password)) {
        return next(new CustomError("Regno and Password is Required"))
    }

    const user = await Admin.findOne({ regNo }).select("+password")

    if (!user) {
        return next(new CustomError("Regno and Password Does not Match", 400))
    }
    const isPasswordCorrect = await user.isValidatedPassword(password);
    if (!isPasswordCorrect) {
        return next(new CustomError("Email or Password does not Match", 400))
    }
    cookieToken(user, res);
})

//logout
exports.logoutAdmin = BigPromise(async (req, res, next) => {
    res.cookie('token', null, {
      expires: new Date(Date.now()),
      httpOnly: true,
    })
    res.status(200).json({
      success: true,
      message: "Logout Success"
    })
  });