const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: "pawarsudhir84@gmail.com",
    subject: "Welcome to Task Manager App",
    text: `Welcome to the app ${name}. Let me know how you get along with app.`,
  });
};

const sendCancelationEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: "pawarsudhir84@gmail.com",
    subject: "Account removed",
    text: `Hi ${name}, 
    Your account is removed succeddfully. Please provide feedback on how we might have kept you onboard.`,
  });
};

module.exports = {
  sendWelcomeEmail,
  sendCancelationEmail,
};
