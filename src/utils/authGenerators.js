import otpGenerator from "otp-generator";
import twilio from "twilio";
import dotenv from "dotenv";

dotenv.config();

// Twilio client setup
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

function isValidIndianPhoneNumber(phoneNumber) {
  const indianPhoneNumberRegex = /^\+91\d{10}$/;
  return indianPhoneNumberRegex.test(phoneNumber);
}

async function sendOtpViaTwilio(phone_number, otp) {
  const messageBody = `Your signup OTP is ${otp}`;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;
  const toNumber = phone_number;

  await client.messages.create({
    body: messageBody,
    from: fromNumber,
    to: toNumber,
  });
}

function generateOtp() {
  const otp = otpGenerator.generate(6, {
    upperCaseAlphabets: false,
    lowerCaseAlphabets: false,
    specialChars: false,
  });
  return otp;
}

function generateOtpExiry() {
  return new Date(Date.now() + 30 * 60 * 1000);
}

export {
  sendOtpViaTwilio,
  generateOtp,
  generateOtpExiry,
  isValidIndianPhoneNumber,
};
