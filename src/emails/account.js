const sgMail = require("@sendgrid/mail");
// const sendgridAPIKey =
//   "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";

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

sgMail
  .send({
    to: "vanbvy@gmail.com",
    from: "vanbvy@gmail.com",
    subject: "This is my first creation",
    text: "I hope this one actually get to you.",
  })
  .then(() => {})
  .catch((error) => {
    console.log(error.response.body);
    // console.log(error.response.body.errors[0].message)
  });

const sendWelcomeEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: "vanbvy@gmail.com",
    subject: "Thank for joining in!",
    text: `Welcome to the app, ${name}. Let me know how you get along with the app.`,
  });
};
const sendCancelationEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: "vanbvy@gmail.com",
    subject: "Goodbye",
    text: `Sorry to see you go, ${name}. Hope to see you back.`,
  });
};

module.exports = {
  sendWelcomeEmail,
  sendCancelationEmail,
};
