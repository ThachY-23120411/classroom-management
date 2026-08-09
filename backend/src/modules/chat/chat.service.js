const crypto = require("crypto");
const chatRepository = require("./chat.repository");
const studentRepository = require("../students/student.repository");

function buildRoomName(studentPhone) {
  return `chat:${studentPhone}`;
}

function assertMessagePayload({ studentPhone, senderRole, text }) {
  if (!studentPhone) {
    throw new Error("studentPhone is required");
  }

  if (!senderRole) {
    throw new Error("senderRole is required");
  }

  if (!["instructor", "student"].includes(senderRole)) {
    throw new Error("senderRole must be instructor or student");
  }

  if (!text || !text.trim()) {
    throw new Error("text is required");
  }
}

async function getStudentForChat(studentPhone) {
  const student = await studentRepository.findStudentByPhone(studentPhone);

  if (!student || student.role !== "student") {
    throw new Error("Student not found");
  }

  return student;
}

function resolveSender({ student, senderPhone, senderName, senderRole }) {
  if (senderRole === "student") {
    if (senderPhone && senderPhone !== student.phone) {
      throw new Error("Student can only send messages in their own chat");
    }

    return {
      senderPhone: student.phone,
      senderName: student.name || "Student",
    };
  }

  const instructorPhone = student.instructorPhone;

  if (!instructorPhone) {
    throw new Error("Student does not have an assigned instructor");
  }

  if (senderPhone && senderPhone !== instructorPhone) {
    throw new Error("Instructor is not assigned to this student");
  }

  return {
    senderPhone: instructorPhone,
    senderName: student.instructorName || senderName || "Instructor",
  };
}

async function getMessages(studentPhone) {
  if (!studentPhone) {
    throw new Error("studentPhone is required");
  }

  const thread = await chatRepository.getMessageThread(studentPhone);

  return Array.isArray(thread.messages) ? thread.messages : [];
}

async function createMessage({
  studentPhone,
  senderPhone,
  senderName,
  senderRole,
  text,
}) {
  assertMessagePayload({ studentPhone, senderRole, text });

  const student = await getStudentForChat(studentPhone);
  const sender = resolveSender({
    student,
    senderPhone,
    senderName,
    senderRole,
  });
  const now = new Date().toISOString();
  const message = {
    id: crypto.randomUUID(),
    studentPhone,
    senderPhone: sender.senderPhone,
    senderName: sender.senderName,
    senderRole,
    text: text.trim(),
    createdAt: now,
  };

  await chatRepository.appendMessage(studentPhone, message);

  return message;
}

async function joinRoom({ studentPhone }) {
  if (!studentPhone) {
    throw new Error("studentPhone is required");
  }

  const messages = await getMessages(studentPhone);

  return {
    room: buildRoomName(studentPhone),
    studentPhone,
    messages,
  };
}

module.exports = {
  buildRoomName,
  getMessages,
  createMessage,
  joinRoom,
};
