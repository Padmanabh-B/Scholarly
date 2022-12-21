const User = require("../model/user")
const BigPromise = require("../middlewares/bigPromise")
const CustomError = require("../utils/customError")
const jwt = require("jsonwebtoken")

exports.isLoggedIn = BigPromise(async (req, res, next) => {
    const token = req.cookies.token || req.header("Authorization").replace("Bearer ", "");

    //if not token
    if (!token) {
        return next(new CustomError("Login first to access this page", 401))
    }

    //decode the token __ verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    //grabing information of user based on id
    req.user = await User.findById(decoded.id)

    next()
})


exports.customRoles = (...roles) => {
    return (req, _res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new CustomError("You are not allowed for this resource", 402))

        }
        next();
    }
}