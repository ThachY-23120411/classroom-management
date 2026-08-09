const { getFirebaseDb } = require("../../integrations/firebase/firebaseClient");

function getMessagesCollection() {
  return getFirebaseDb().collection("messages");
}

async function getMessageThread(studentPhone) {
  const threadSnapshot = await getMessagesCollection().doc(studentPhone).get();

  if (!threadSnapshot.exists) {
    return {
      studentPhone,
      messages: [],
    };
  }

  return {
    id: threadSnapshot.id,
    ...threadSnapshot.data(),
  };
}

async function appendMessage(studentPhone, message) {
  const db = getFirebaseDb();
  const threadRef = db.collection("messages").doc(studentPhone);

  await db.runTransaction(async (transaction) => {
    const threadSnapshot = await transaction.get(threadRef);
    const now = new Date().toISOString();

    if (!threadSnapshot.exists) {
      transaction.set(threadRef, {
        studentPhone,
        messages: [message],
        createdAt: now,
        updatedAt: now,
      });

      return;
    }

    const thread = threadSnapshot.data();
    const currentMessages = Array.isArray(thread.messages)
      ? thread.messages
      : [];

    transaction.update(threadRef, {
      messages: [...currentMessages, message],
      updatedAt: now,
    });
  });

  return message;
}

module.exports = {
  getMessageThread,
  appendMessage,
};
