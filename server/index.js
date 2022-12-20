require("dotenv").config()
require("./config/dataConn").dbConnection()
const app = require("./app")
const cloudinary = require("cloudinary").v2
const { config } = require("./config/secret.Conifg");



cloudinary.config({
    cloud_name: config.CLOUDINARY_NAME,
    api_key: config.CLOUDINARY_API_KEY,
    api_secret: config.CLOUDINARY_API_SECRET,
})



app.listen(config.PORT, () => {
    console.log(`Server is Running on Port http://localhost:${config.PORT}`);
})