const Admin = require("../models/admin.model")
const BigPromise = require("../middlewares/BigPromise.middleware")
const CustomError = require("../utils/customError")
const jwt = require("jsonwebtoken")

exports.isLoggedIn = BigPromise(async (req, res, next) => {
    let token;

    if (req.cookies.token ||
        (req.headers.authorization && req.headers.authorization.startsWith("Bearer"))) {
        token = req.cookies.token || req.headers.authorization.split(" ")[1]
    }

    if (!token) {
        res.status(401).json({
            success:false,
            message:"You are Not Authorized Person"
        })
        throw new CustomError("Not authorized to access this route", 401)
    }

    try {

        const decodedJwtPayload = jwt.verify(token, process.env.JWT_SECRET)
       
        //_id, findUser based on Id set this in req.user
        req.profile = await Admin.findById(decodedJwtPayload.id)
        next();
    } catch (error) {
        throw new CustomError("Not authorized to access this route", 401)
    }
})