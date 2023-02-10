import * as nodemailer from 'nodemailer';

export const testAccount: nodemailer.TestAccount = await nodemailer.createTestAccount()
.catch((err) => {
    console.error('Failed to create a testing account. ' + err.message);
    return process.exit(1);
});