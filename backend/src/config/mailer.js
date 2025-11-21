// Simple nodemailer transport (console fallback)
const nodemailer = require('nodemailer');

const transport = nodemailer.createTransport(
  process.env.MAIL_URL || {
    host: process.env.MAIL_HOST || 'smtp.example.com',
    port: process.env.MAIL_PORT ? Number(process.env.MAIL_PORT) : 587,
    secure: false,
    auth: {
      user: process.env.MAIL_USER || '',
      pass: process.env.MAIL_PASS || ''
    }
  }
);

// fallback: if transport fails, you can log instead of sending
module.exports = {
  sendMail: async (opts) => {
    try {
      const info = await transport.sendMail(opts);
      return info;
    } catch (err) {
      console.error('Mail send failed, fallback to console', err);
      console.log('Mail payload', opts);
      return null;
    }
  }
};