require('dotenv').config()

exports.config = {
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRY: process.env.JWT_EXPIRY || "3d",
    DB_URL: process.env.DB_URL,
    PORT: process.env.PORT,


    //cloudinary config
    CLOUDINARY_NAME : process.env.CLOUDINARY_NAME,
    CLOUDINARY_API_KEY : process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET : process.env.CLOUDINARY_API_SECRET,



    //@ nodemailer config  

    SMTP_MAIL_HOST: process.env.SMTP_MAIL_HOST,
    SMTP_MAIL_VALUE: process.env.SMTP_MAIL_VALUE,
    SMTP_MAIL_USERNAME: process.env.SMTP_MAIL_USERNAME,
    SMTP_MAIL_PASSWORD: process.env.SMTP_MAIL_PASSWORD,
    SMTP_MAIL_EMAIL: process.env.SMTP_MAIL_EMAIL,

}

