import nodemailer from 'nodemailer';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';

let options: SMTPTransport.Options;

const prodOptions: SMTPTransport.Options = {
    host: process.env["SMTP_HOST"],
    port: process.env["SMTP_PORT"] as unknown as number,
    auth: {
        user: process.env["SMTP_USERNAME"],
        pass: process.env["SMTP_PASSWORD"],
    }
};

async function transporter() {
    await nodemailer.createTestAccount()
    .then((testAccount) => {
        const devOptions: SMTPTransport.Options = {
            host: process.env["SMTP_DEV_HOST"],
            port: process.env["SMTP_PORT"] as unknown as number,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            }
        }
        process.env["NODE_ENV"] === 'production' ? options = prodOptions : options = devOptions, console.log(`Ethereal credentials: ${testAccount.user} + ${testAccount.pass}`);
    })
    .catch((err: Error) => {
        console.error('Failed to create a testing account. ' + err.message);
        return process.exit(1);
    });
    return nodemailer.createTransport(options);
};

const transport = transporter();

export { transport }