import * as nodemailer from "nodemailer";
import * as SMTPTransport from "nodemailer/lib/smtp-transport";

let options: SMTPTransport.Options;

const prodOptions: SMTPTransport.Options = {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT as unknown as number,
    auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD,
    }
}

const devOptions: SMTPTransport.Options = {
    host: process.env.SMTP_DEV_HOST,
    port: process.env.SMTP_PORT as unknown as number,
    auth: {
        user: process.env.SMTP_DEV_USERNAME,
        pass: process.env.SMTP_DEV_PASSWORD,
    }
}


process.env.NODE_ENV === 'production' ? options = prodOptions : options = devOptions;

export const transport: nodemailer.Transporter = nodemailer.createTransport(options);