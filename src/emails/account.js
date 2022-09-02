const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: "azeezlawal2002@gmail.com",
    subject: "Thanks for Joining in!",
    text: `Welcome to the app, ${name}. Let me know how you get along with the app.`,
  });
};

const sendCancelationEmail = (email, user) => {
  sgMail.send({
    to: email,
    from: "azeezlawal2002@gmail.com",
    subject: "You have sucessfully deleted your account with us",
    text: `Hello ${user},kindly send us an email to let us know what we could have done better to retain you as our customer`,
  });
};

module.exports = {
  sendWelcomeEmail,
  sendCancelationEmail,
};
