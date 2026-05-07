// Firebase Configuration
// Replace these with your Firebase project credentials from Firebase Console
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
let db = null;
let auth = null;

try {
  firebase.initializeApp(firebaseConfig);
  db = firebase.firestore();
  auth = firebase.auth();
  console.log('Firebase initialized successfully');
} catch (error) {
  console.warn('Firebase initialization failed:', error);
  console.warn('Using localStorage fallback for development');
}

// Firestore Helper Functions
async function addDocument(collection, data) {
  if (!db) return null;
  try {
    const docRef = await db.collection(collection).add({
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return docRef.id;
  } catch (error) {
    console.error(`Error adding to ${collection}:`, error);
    return null;
  }
}

async function getDocuments(collection) {
  if (!db) return [];
  try {
    const snapshot = await db.collection(collection).get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error(`Error fetching ${collection}:`, error);
    return [];
  }
}

async function updateDocument(collection, docId, data) {
  if (!db) return false;
  try {
    await db.collection(collection).doc(docId).update({
      ...data,
      updatedAt: new Date()
    });
    return true;
  } catch (error) {
    console.error(`Error updating ${collection}:`, error);
    return false;
  }
}

async function deleteDocument(collection, docId) {
  if (!db) return false;
  try {
    await db.collection(collection).doc(docId).delete();
    return true;
  } catch (error) {
    console.error(`Error deleting from ${collection}:`, error);
    return false;
  }
}

async function queryDocuments(collection, field, operator, value) {
  if (!db) return [];
  try {
    const snapshot = await db.collection(collection).where(field, operator, value).get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error(`Error querying ${collection}:`, error);
    return [];
  }
}

async function getUserByEmail(email) {
  return queryDocuments('users', 'email', '==', email);
}

async function getClassesByInstructor(instructorId) {
  return queryDocuments('classes', 'instructorId', '==', instructorId);
}

async function getEnrollmentsByStudent(studentId) {
  return queryDocuments('enrollments', 'studentId', '==', studentId);
}

async function getTasksByAssignee(assigneeId) {
  return queryDocuments('tasks', 'assigneeId', '==', assigneeId);
}

async function getAssignmentsByClass(classId) {
  return queryDocuments('assignments', 'classId', '==', classId);
}
