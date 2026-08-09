require("dotenv").config();

const { getFirebaseDb } = require("../integrations/firebase/firebaseClient");

const instructor = {
  phone: "+15550000001",
  name: "Alex Instructor",
  email: "instructor@classroom.local",
  role: "instructor",
};

const secondInstructor = {
  phone: "+15550000006",
  name: "Jamie Instructor",
  email: "jamie@classroom.local",
  role: "instructor",
};

const instructors = [instructor, secondInstructor];

const students = [
  {
    phone: "+15550000002",
    name: "Mia Nguyen",
    email: "mia@classroom.local",
    address: "12 Nguyen Trai, District 1",
  },
  {
    phone: "+15550000003",
    name: "Taylor Student",
    email: "taylor@classroom.local",
    address: "45 Le Loi, District 3",
  },
  {
    phone: "+15550000004",
    name: "Jordan Lee",
    email: "jordan@classroom.local",
    address: "78 Pasteur, District 1",
  },
  {
    phone: "+15550000005",
    name: "Casey Tran",
    email: "casey@classroom.local",
    address: "21 Vo Van Tan, District 3",
  },
  {
    phone: "+15550000007",
    name: "Riley Pham",
    email: "riley@classroom.local",
    address: "9 Hai Ba Trung, District 1",
    instructorPhone: secondInstructor.phone,
    instructorName: secondInstructor.name,
  },
];

const lessonSeeds = [
  {
    id: "lesson-mia-react-basics",
    studentPhone: "+15550000002",
    title: "React component basics",
    description: "Build a small profile card with props, state, and a submit button.",
    completed: false,
    status: "assigned",
  },
  {
    id: "lesson-mia-express-validation",
    studentPhone: "+15550000002",
    title: "Express route validation",
    description: "Create one POST endpoint and validate the request body before calling service.",
    completed: true,
    status: "done",
  },
  {
    id: "lesson-taylor-firestore-modeling",
    studentPhone: "+15550000003",
    title: "Firestore data modeling",
    description: "Explain how users, lessons, and messages are related in this app.",
    completed: false,
    status: "assigned",
  },
  {
    id: "lesson-taylor-socket-chat",
    studentPhone: "+15550000003",
    title: "Socket.io chat flow",
    description: "Draw the flow from joinRoom to sendMessage and room broadcast.",
    completed: false,
    status: "assigned",
  },
  {
    id: "lesson-jordan-layered-architecture",
    studentPhone: "+15550000004",
    title: "Layered architecture practice",
    description: "Write one API using route, controller, service, and repository layers.",
    completed: true,
    status: "done",
  },
  {
    id: "lesson-casey-auth-flow",
    studentPhone: "+15550000005",
    title: "Passwordless auth flow",
    description: "Test phone login and email login with valid and invalid access codes.",
    completed: false,
    status: "assigned",
  },
  {
    id: "lesson-casey-profile-update",
    studentPhone: "+15550000005",
    title: "Student profile update",
    description: "Update your student name and email from the student portal.",
    completed: true,
    status: "done",
  },
  {
    id: "lesson-riley-dashboard-review",
    studentPhone: "+15550000007",
    title: "Dashboard review",
    description: "Review the student dashboard and send one question to your instructor.",
    completed: false,
    status: "assigned",
  },
];

function minutesAgo(minutes) {
  return new Date(Date.now() - minutes * 60 * 1000).toISOString();
}

function normalizePhoneForId(phone) {
  return String(phone).replace(/\D/g, "") || "unknown";
}

function getInstructorForStudent(student) {
  return (
    instructors.find((item) => item.phone === student.instructorPhone) ||
    instructor
  );
}

function buildLessonRecord(lesson, student, now) {
  const completedAt = lesson.completed ? minutesAgo(45) : null;
  const assignedInstructor = getInstructorForStudent(student);

  return {
    id: lesson.id,
    studentPhone: student.phone,
    studentName: student.name,
    assignedByPhone: assignedInstructor.phone,
    assignedByName: assignedInstructor.name,
    title: lesson.title,
    description: lesson.description,
    completed: lesson.completed,
    status: lesson.status,
    assignedAt: minutesAgo(120),
    completedAt,
    createdAt: minutesAgo(120),
    updatedAt: completedAt || now,
  };
}

function buildMessagesForStudent(student, lessons, now) {
  const firstLesson = lessons[0];
  const latestLesson = lessons[lessons.length - 1];
  const assignedInstructor = getInstructorForStudent(student);

  return [
    {
      id: `message-${student.phone}-1`,
      studentPhone: student.phone,
      senderPhone: assignedInstructor.phone,
      senderName: assignedInstructor.name,
      senderRole: "instructor",
      text: `Hi ${student.name}, I assigned "${firstLesson.title}" for you.`,
      createdAt: minutesAgo(95),
    },
    {
      id: `message-${student.phone}-2`,
      studentPhone: student.phone,
      senderPhone: student.phone,
      senderName: student.name,
      senderRole: "student",
      text: "I saw it. I will work on it today.",
      createdAt: minutesAgo(80),
    },
    {
      id: `message-${student.phone}-3`,
      studentPhone: student.phone,
      senderPhone: assignedInstructor.phone,
      senderName: assignedInstructor.name,
      senderRole: "instructor",
      text: latestLesson.completed
        ? `Nice work on "${latestLesson.title}".`
        : `Remember to finish "${latestLesson.title}" before the next lesson.`,
      createdAt: now,
    },
  ];
}

async function seedFirebase() {
  const db = getFirebaseDb();
  const now = new Date().toISOString();
  const seededStudentPhones = new Set(students.map((student) => student.phone));
  const existingStudentsSnapshot = await db
    .collection("users")
    .where("role", "==", "student")
    .get();
  const extraStudents = existingStudentsSnapshot.docs
    .map((doc) => ({
      id: doc.id,
      ...doc.data(),
      phone: doc.data().phone || doc.id,
      name: doc.data().name || "Demo Student",
      email: doc.data().email || "student@classroom.local",
    }))
    .filter((student) => !seededStudentPhones.has(student.phone));
  const lessonsByStudent = new Map();
  const batch = db.batch();

  for (const lesson of lessonSeeds) {
    const student = students.find((item) => item.phone === lesson.studentPhone);
    const lessonRecord = buildLessonRecord(lesson, student, now);
    const currentLessons = lessonsByStudent.get(student.phone) || [];

    lessonsByStudent.set(student.phone, [...currentLessons, lessonRecord]);
    batch.set(db.collection("lessons").doc(lesson.id), lessonRecord);
  }

  for (const item of instructors) {
    batch.set(db.collection("users").doc(item.phone), {
      ...item,
      accessCode: "",
      accessCodeCreatedAt: null,
      emailAccessCode: "",
      emailAccessCodeCreatedAt: null,
      createdAt: now,
      updatedAt: now,
    });
  }

  for (const student of students) {
    const lessons = lessonsByStudent.get(student.phone) || [];
    const messages = buildMessagesForStudent(student, lessons, now);
    const assignedInstructor = getInstructorForStudent(student);

    batch.set(db.collection("users").doc(student.phone), {
      ...student,
      role: "student",
      status: "Active",
      instructorPhone: assignedInstructor.phone,
      instructorName: assignedInstructor.name,
      accessCode: "",
      accessCodeCreatedAt: null,
      emailAccessCode: "",
      emailAccessCodeCreatedAt: null,
      lessons,
      createdAt: now,
      updatedAt: now,
    });

    batch.set(db.collection("messages").doc(student.phone), {
      studentPhone: student.phone,
      studentName: student.name,
      instructorPhone: assignedInstructor.phone,
      instructorName: assignedInstructor.name,
      messages,
      createdAt: minutesAgo(95),
      updatedAt: now,
    });
  }

  let extraLessonCount = 0;

  for (const student of extraStudents) {
    const currentLessons = Array.isArray(student.lessons) ? student.lessons : [];

    if (currentLessons.length > 0) {
      continue;
    }

    const lesson = buildLessonRecord(
      {
        id: `lesson-existing-${normalizePhoneForId(student.phone)}-onboarding`,
        studentPhone: student.phone,
        title: "Classroom onboarding checkpoint",
        description: "Review your profile, open the message room, and mark this lesson done.",
        completed: false,
        status: "assigned",
      },
      student,
      now
    );
    const messages = buildMessagesForStudent(student, [lesson], now);

    batch.set(db.collection("lessons").doc(lesson.id), lesson);
    batch.set(
      db.collection("users").doc(student.phone),
      {
        status: student.status || "Active",
        instructorPhone: student.instructorPhone || instructor.phone,
        instructorName: student.instructorName || instructor.name,
        lessons: [lesson],
        updatedAt: now,
      },
      { merge: true }
    );
    batch.set(db.collection("messages").doc(student.phone), {
      studentPhone: student.phone,
      studentName: student.name,
      instructorPhone: student.instructorPhone || instructor.phone,
      instructorName: student.instructorName || instructor.name,
      messages,
      createdAt: minutesAgo(95),
      updatedAt: now,
    });

    extraLessonCount += 1;
  }

  await batch.commit();

  console.log("Seed completed");
  console.log(`Seeded users: ${instructors.length} instructors + ${students.length} students`);
  console.log(`Seeded lessons: ${lessonSeeds.length + extraLessonCount}`);
  console.log(`Seeded message threads: ${students.length + extraLessonCount}`);
}

seedFirebase()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  });
