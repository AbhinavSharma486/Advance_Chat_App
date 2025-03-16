import transporter from "./nodemailer.config.js";
import {
  PASSWORD_RESET_REQUEST_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE,
  VERIFICATION_EMAIL_TEMPLATE,
  WELCOME_EMAIL_TEMPLATE
} from "./emailTemplate.js";


export const sendVerificationEmail = async (email, verificationToken) => {

  try {
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "Verify your email",
      html: VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", verificationToken)
    };

    await transporter.sendMail(mailOptions);

  } catch (error) {
    console.error("Error in sending verification email", error);
    throw new Error(`Error in sending verification email: ${error.message}`);
  }
};

export const sendWelcomeEmail = async (email, name) => {

  try {
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "Welcome to Chatify",
      html: WELCOME_EMAIL_TEMPLATE.replace("{name}", name),
    };

    await transporter.sendMail(mailOptions);

  } catch (error) {
    console.error("Error in sending welcome email", error);
    throw new Error(`Error in sending welcome email: ${error.message}`);
  }
};

export const sendPasswordResetEmail = async (email, resetURL) => {

  try {
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "Reset your password",
      html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetURL),
    };

    await transporter.sendMail(mailOptions);

  } catch (error) {
    console.error("Error in sending password reset email", error);
    throw new Error(`Error in sending password reset email: ${error.message}`);
  }
};

export const sendResetSuccessEmail = async (email) => {

  try {
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "Password reset successful",
      html: PASSWORD_RESET_SUCCESS_TEMPLATE,
    };

    await transporter.sendMail(mailOptions);

  } catch (error) {
    console.error("Error in sending password reset success email", error);
    throw new Error(`Error sending password reset success email: ${error.message}`);
  }
};