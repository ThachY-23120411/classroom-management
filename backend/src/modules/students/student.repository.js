const { getFirebaseDb } = require("../../integrations/firebase/firebaseClient");

function getUsersCollection() {
  return getFirebaseDb().collection("users");
}

function getMessagesCollection() {
  return getFirebaseDb().collection("messages");
}

function getLessonsCollection() {
  return getFirebaseDb().collection("lessons");
}

async function findAllStudents() {
  const snapshot = await getUsersCollection().where("role", "==", "student").get();

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

async function findStudentsByInstructor(instructorPhone) {
  const snapshot = await getUsersCollection()
    .where("role", "==", "student")
    .where("instructorPhone", "==", instructorPhone)
    .get();

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

async function findStudentByPhone(phone) {
  const studentSnapshot = await getUsersCollection().doc(phone).get();

  if (!studentSnapshot.exists) {
    return null;
  }

  return {
    id: studentSnapshot.id,
    ...studentSnapshot.data(),
  };
}

async function findStudentByEmail(email) {
  const snapshot = await getUsersCollection().where("email", "==", email).get();

  if (snapshot.empty) {
    return null;
  }

  const studentDocument = snapshot.docs.find(
    (doc) => doc.data().role === "student"
  );

  if (!studentDocument) {
    return null;
  }

  return {
    id: studentDocument.id,
    ...studentDocument.data(),
  };
}

async function createStudent(student) {
  await getUsersCollection().doc(student.phone).set(student);

  return student;
}

async function createStudentMessageThread({
  phone,
  name,
  instructorPhone,
  instructorName,
  now,
}) {
  await getMessagesCollection().doc(phone).set({
    studentPhone: phone,
    studentName: name,
    instructorPhone,
    instructorName,
    messages: [],
    createdAt: now,
    updatedAt: now,
  });
}

async function updateStudent(phone, data) {
  await getUsersCollection().doc(phone).update(data);

  return findStudentByPhone(phone);
}

async function deleteStudent(phone) {
  const db = getFirebaseDb();
  const lessonsSnapshot = await db
    .collection("lessons")
    .where("studentPhone", "==", phone)
    .get();
  const batch = db.batch();

  batch.delete(db.collection("users").doc(phone));
  batch.delete(db.collection("messages").doc(phone));
  lessonsSnapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });

  await batch.commit();
}

async function createLesson(lesson) {
  await getLessonsCollection().doc(lesson.id).set(lesson);

  return lesson;
}

async function updateLesson(lessonId, data) {
  await getLessonsCollection().doc(lessonId).set(data, { merge: true });
}

module.exports = {
  findAllStudents,
  findStudentsByInstructor,
  findStudentByPhone,
  findStudentByEmail,
  createStudent,
  createStudentMessageThread,
  updateStudent,
  deleteStudent,
  createLesson,
  updateLesson,
};
