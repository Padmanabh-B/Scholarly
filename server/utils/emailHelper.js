const nodemailer = require("nodemailer")
const config = require("../config/secret.Conifg")

const mailHelper = async (options) => {
    const testAccount = await nodemailer.createTestAccount();

    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        auth: {
            user: process.env.SMTP_USER, // generated ethereal user
            pass: process.env.SMTP_PASS, // generated ethereal password
        },
    });

    // send mail with defined transport object

    const message = {
        from: 'scholary@noreplay.com', // sender address
        to: options.email,// list of receivers
        subject: options.subject, // Subject line
        text: options.message, // plain text body

    }
    await transporter.sendMail(message);
}

module.exports = mailHelper;