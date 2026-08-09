const twilio = require("twilio");
require("dotenv").config();

function isTwilioConfigured() {
  return (
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_FROM_PHONE
  );
}

async function sendAccessCodeSms(phoneNumber, accessCode) {
  if (!isTwilioConfigured()) {
    return {
      sent: false,
      provider: "twilio",
      errorMessage: "Missing Twilio environment variables",
    };
  }

  try {
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    const message = await client.messages.create({
      from: process.env.TWILIO_FROM_PHONE,
      to: phoneNumber,
      body: `Your Classroom Management access code is ${accessCode}`,
    });

    return {
      sent: true,
      provider: "twilio",
      messageSid: message.sid,
    };
  } catch (error) {
    return {
      sent: false,
      provider: "twilio",
      errorCode: error.code,
      errorMessage: error.message,
    };
  }
}

module.exports = {
  sendAccessCodeSms,
};
