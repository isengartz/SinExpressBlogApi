const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Create Transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SMTP,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  // Define Options
  const mailOptions = {
    from: 'Kontokostas Thanasis <kontokostas.thanasis@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
  };
  // Send the email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
