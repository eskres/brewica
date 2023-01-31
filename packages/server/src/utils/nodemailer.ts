import * as nodemailer from "nodemailer";
import SMTPTransport = require("nodemailer/lib/smtp-transport");


const mailService: SMTPTransport.Options = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT as unknown as number,
    secure: true,
    auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD,
    },
});

module.exports = mailService;

// process.env.SMTP_SENDER