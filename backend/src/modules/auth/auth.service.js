const { getFirebaseDb } = require("../../integrations/firebase/firebaseClient");
const { sendAccessCodeSms } = require("../../integrations/twilio/twilioService");
const studentRepository = require("../students/student.repository");
const {
  sendStudentAccessCodeEmail,
} = require("../../integrations/email/emailService");

function generateAccessCode() {
  return Math.floor(100000 + Math.random() * 900000).toString(); 
}

async function createAccessCode(phoneNumber) {
  const db = getFirebaseDb();

  const userRef = db.collection("users").doc(phoneNumber);
  const userSnapshot = await userRef.get();

  if (!userSnapshot.exists) {
    throw new Error("Phone number not found");
  }

  const accessCode = generateAccessCode();

  await userRef.update({
    accessCode,
    accessCodeCreatedAt: new Date().toISOString(),
  });

  const smsResult = await sendAccessCodeSms(phoneNumber, accessCode);

  return {
    phoneNumber,
    message: "Access code created successfully",
    sms: smsResult,
    accessCode: smsResult.sent ? undefined : accessCode,
  };
}

async function validateAccessCode(phoneNumber, accessCode) {
  const db = getFirebaseDb();

  const userRef = db.collection("users").doc(phoneNumber);
  const userSnapshot = await userRef.get();

  if (!userSnapshot.exists) {
    throw new Error("Phone number not found");
  }

  const user = userSnapshot.data();

  if (user.accessCode !== accessCode) {
    throw new Error("Invalid access code");
  }

  await userRef.update({
    accessCode: "",
    accessCodeCreatedAt: null,
  });

  return {
    phone: user.phone,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

async function loginEmail(email) {
  const student = await studentRepository.findStudentByEmail(email);

  if (!student) {
    throw new Error("Student email not found");
  }

  const accessCode = generateAccessCode();
  const now = new Date().toISOString();

  await studentRepository.updateStudent(student.phone, {
    emailAccessCode: accessCode,
    emailAccessCodeCreatedAt: now,
    updatedAt: now,
  });

  const emailResult = await sendStudentAccessCodeEmail({
    to: email,
    accessCode,
  });

  return {
    email,
    message: "Email access code created successfully",
    emailDelivery: emailResult,
    accessCode,
  };
}

async function validateEmailAccessCode({ email, accessCode }) {
  const student = await studentRepository.findStudentByEmail(email);

  if (!student) {
    throw new Error("Student email not found");
  }

  if (student.emailAccessCode !== accessCode) {
    throw new Error("Invalid access code");
  }

  await studentRepository.updateStudent(student.phone, {
    emailAccessCode: "",
    emailAccessCodeCreatedAt: null,
    updatedAt: new Date().toISOString(),
  });

  return {
    success: true,
    student: {
      phone: student.phone,
      name: student.name,
      email: student.email,
      role: student.role,
    },
  };
}

module.exports = {
  createAccessCode,
  validateAccessCode,
  loginEmail,
  validateEmailAccessCode,
};
