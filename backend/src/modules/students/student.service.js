const crypto = require("crypto");
const studentRepository = require("./student.repository");
const {
  sendStudentInviteEmail,
} = require("../../integrations/email/emailService");

const DEFAULT_INSTRUCTOR = {
  phone: "+15550000001",
  name: "Alex Instructor",
};

function buildLesson({ title, description }) {
  const now = new Date().toISOString();

  return {
    id: crypto.randomUUID(),
    title,
    description,
    completed: false,
    status: "assigned",
    assignedAt: now,
    completedAt: null,
    createdAt: now,
    updatedAt: now,
  };
}

function removeInternalFields(student) {
  const {
    accessCode,
    accessCodeCreatedAt,
    emailAccessCode,
    emailAccessCodeCreatedAt,
    ...safeStudent
  } = student;

  return safeStudent;
}

async function addStudent({ name, phone, email, instructorPhone, instructorName }) {
  const existingStudent = await studentRepository.findStudentByPhone(phone);

  if (existingStudent) {
    throw new Error("Student phone already exists");
  }

  const now = new Date().toISOString();
  const ownerPhone = instructorPhone || DEFAULT_INSTRUCTOR.phone;
  const ownerName = instructorName || DEFAULT_INSTRUCTOR.name;

  const student = {
    phone,
    name,
    email,
    role: "student",
    instructorPhone: ownerPhone,
    instructorName: ownerName,
    accessCode: "",
    accessCodeCreatedAt: null,
    emailAccessCode: "",
    emailAccessCodeCreatedAt: null,
    lessons: [],
    createdAt: now,
    updatedAt: now,
  };

  await studentRepository.createStudent(student);
  await studentRepository.createStudentMessageThread({
    phone,
    name,
    instructorPhone: ownerPhone,
    instructorName: ownerName,
    now,
  });

  const inviteEmail = await sendStudentInviteEmail({
    to: email,
    name,
    phone,
  });

  return {
    ...removeInternalFields(student),
    inviteEmail,
  };
}

async function getStudents({ instructorPhone } = {}) {
  const students = instructorPhone
    ? await studentRepository.findStudentsByInstructor(instructorPhone)
    : await studentRepository.findAllStudents();

  return students.map(removeInternalFields);
}

async function getStudentByPhone(phone) {
  const student = await studentRepository.findStudentByPhone(phone);

  if (!student || student.role !== "student") {
    throw new Error("Student not found");
  }

  return removeInternalFields(student);
}

async function editStudent(phone, { name, email }) {
  const student = await studentRepository.findStudentByPhone(phone);

  if (!student || student.role !== "student") {
    throw new Error("Student not found");
  }

  const updateData = {
    updatedAt: new Date().toISOString(),
  };

  if (name !== undefined) {
    updateData.name = name;
  }

  if (email !== undefined) {
    updateData.email = email;
  }

  const updatedStudent = await studentRepository.updateStudent(phone, updateData);

  return removeInternalFields(updatedStudent);
}

async function deleteStudent(phone) {
  const student = await studentRepository.findStudentByPhone(phone);

  if (!student || student.role !== "student") {
    throw new Error("Student not found");
  }

  await studentRepository.deleteStudent(phone);
}

async function assignLesson({ studentPhone, title, description }) {
  const student = await studentRepository.findStudentByPhone(studentPhone);

  if (!student || student.role !== "student") {
    throw new Error("Student not found");
  }

  const instructorPhone = student.instructorPhone || DEFAULT_INSTRUCTOR.phone;
  const instructorName = student.instructorName || DEFAULT_INSTRUCTOR.name;
  const lesson = {
    ...buildLesson({ title, description }),
    studentPhone,
    studentName: student.name,
    assignedByPhone: instructorPhone,
    assignedByName: instructorName,
  };
  const currentLessons = Array.isArray(student.lessons) ? student.lessons : [];

  await studentRepository.updateStudent(studentPhone, {
    lessons: [...currentLessons, lesson],
    updatedAt: new Date().toISOString(),
  });
  await studentRepository.createLesson(lesson);

  return lesson;
}

async function getMyLessons(phone) {
  const student = await studentRepository.findStudentByPhone(phone);

  if (!student || student.role !== "student") {
    throw new Error("Student not found");
  }

  return Array.isArray(student.lessons) ? student.lessons : [];
}

async function markLessonDone({ phone, lessonId }) {
  const student = await studentRepository.findStudentByPhone(phone);

  if (!student || student.role !== "student") {
    throw new Error("Student not found");
  }

  const lessons = Array.isArray(student.lessons) ? student.lessons : [];
  let updatedLesson = null;
  const now = new Date().toISOString();

  const updatedLessons = lessons.map((lesson) => {
    if (lesson.id !== lessonId) {
      return lesson;
    }

    updatedLesson = {
      ...lesson,
      completed: true,
      status: "done",
      completedAt: now,
    };

    return updatedLesson;
  });

  if (!updatedLesson) {
    throw new Error("Lesson not found");
  }

  await studentRepository.updateStudent(phone, {
    lessons: updatedLessons,
    updatedAt: now,
  });
  await studentRepository.updateLesson(lessonId, {
    completed: true,
    status: "done",
    completedAt: now,
    updatedAt: now,
  });

  return updatedLesson;
}

async function editProfile({ phone, name, email }) {
  const student = await studentRepository.findStudentByPhone(phone);

  if (!student || student.role !== "student") {
    throw new Error("Student not found");
  }

  const updateData = {
    updatedAt: new Date().toISOString(),
  };

  if (name !== undefined) {
    updateData.name = name;
  }

  if (email !== undefined) {
    updateData.email = email;
  }

  const updatedStudent = await studentRepository.updateStudent(phone, updateData);

  return removeInternalFields(updatedStudent);
}

module.exports = {
  addStudent,
  getStudents,
  getStudentByPhone,
  editStudent,
  deleteStudent,
  assignLesson,
  getMyLessons,
  markLessonDone,
  editProfile,
};
