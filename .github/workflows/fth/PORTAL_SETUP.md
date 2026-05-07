# Portal Backend & Storage Setup Guide

## Overview

The LLM Portal supports three data storage options:

1. **Browser localStorage** (Development/Local)
2. **Firebase Firestore** (Production/Cloud)
3. **Node.js + SQLite Backend** (Self-hosted)

---

## Option 1: Browser localStorage (Current - Local Only)

### How it works:
- Data stored in browser's local storage
- Not synced across devices or users
- Best for: Testing, single-user demos
- No server required

### To use:
1. Portal automatically uses localStorage if Firebase isn't configured
2. Data persists while browser cache is intact
3. Clearing browser cache = data loss

---

## Option 2: Firebase Firestore (Recommended for Production)

### Setup Steps:

#### 1. Create Firebase Project
```
1. Go to: https://console.firebase.google.com
2. Click "Add project"
3. Name: "FirstTechHub"
4. Follow setup wizard
```

#### 2. Enable Firestore Database
```
1. In Firebase console, go to Firestore Database
2. Click "Create database"
3. Select "Start in production mode"
4. Choose region closest to you
5. Click "Enable"
```

#### 3. Create Security Rules
In Firestore > Rules, paste:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Authenticated users can read/write their own data
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

#### 4. Enable Authentication
```
1. Go to Authentication section
2. Enable "Email/Password" provider
```

#### 5. Get Firebase Config
```
1. Go to Project Settings (gear icon)
2. Scroll to "Your apps"
3. Click the web app (</> icon)
4. Copy the config object
```

#### 6. Update firebase-config.js
Replace YOUR_* values in `js/firebase-config.js`:
```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef123456"
};
```

#### 7. Create Firestore Collections
Run this in Firebase Console > Firestore:

```javascript
// Add to document: db.collection("classes").add({
  title: "AI Skills Mastery",
  instructor: "Ava Chen",
  schedule: "Tue/Thu 4pm",
  createdAt: new Date(),
  createdBy: "admin"
})
```

Or use the Firebase UI to create collections manually:
- `classes` - Class schedules
- `tasks` - Assigned tasks
- `assignments` - Student assignments
- `enrollments` - Student-to-class mappings
- `users` - User profiles with roles

---

## Option 3: Node.js + Express Backend (Self-Hosted)

### Installation:

#### 1. Install Dependencies
```bash
cd c:\Users\DAVID\Documents\fth
npm init -y
npm install express cors sqlite3 dotenv
```

#### 2. Create Backend Server (`server.js`)
```javascript
const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const fs = require('fs');

const app = express();
const db = new Database('portal.db');

// Enable CORS for frontend
app.use(cors());
app.use(express.json());

// Initialize database tables
db.exec(`
  CREATE TABLE IF NOT EXISTS classes (
    id TEXT PRIMARY KEY,
    title TEXT,
    instructor TEXT,
    schedule TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  
  CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    title TEXT,
    assigneeId TEXT,
    status TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  
  CREATE TABLE IF NOT EXISTS assignments (
    id TEXT PRIMARY KEY,
    title TEXT,
    classId TEXT,
    dueDate TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  
  CREATE TABLE IF NOT EXISTS enrollments (
    id TEXT PRIMARY KEY,
    studentId TEXT,
    classId TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// API Routes
app.get('/api/classes', (req, res) => {
  const rows = db.prepare('SELECT * FROM classes').all();
  res.json(rows);
});

app.post('/api/classes', (req, res) => {
  const { title, instructor, schedule } = req.body;
  const id = `class-${Date.now()}`;
  db.prepare('INSERT INTO classes (id, title, instructor, schedule) VALUES (?, ?, ?, ?)').run(id, title, instructor, schedule);
  res.json({ id, title, instructor, schedule });
});

app.get('/api/tasks', (req, res) => {
  const rows = db.prepare('SELECT * FROM tasks').all();
  res.json(rows);
});

app.post('/api/tasks', (req, res) => {
  const { title, assigneeId, status } = req.body;
  const id = `task-${Date.now()}`;
  db.prepare('INSERT INTO tasks (id, title, assigneeId, status) VALUES (?, ?, ?, ?)').run(id, title, assigneeId, status);
  res.json({ id, title, assigneeId, status });
});

// Similar endpoints for assignments and enrollments...

app.listen(3000, () => {
  console.log('Portal backend running on http://localhost:3000');
});
```

#### 3. Update Frontend to Use Backend
In `js/portal.js`:
```javascript
async function getClasses() {
  const response = await fetch('http://localhost:3000/api/classes');
  return response.json();
}

async function addClass(data) {
  const response = await fetch('http://localhost:3000/api/classes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return response.json();
}
```

#### 4. Run Server
```bash
node server.js
```

---

## Database Schema (Firestore or SQLite)

### Collections/Tables:

#### users
```
{
  id: "user-123",
  name: "John Doe",
  email: "john@example.com",
  role: "student|learner|tutor|mentor|admin",
  bio: "Student bio",
  createdAt: timestamp
}
```

#### classes
```
{
  id: "class-456",
  title: "AI Skills Mastery",
  instructor: "Ava Chen",
  schedule: "Tue/Thu 4pm",
  createdBy: "user-123",
  createdAt: timestamp
}
```

#### tasks
```
{
  id: "task-789",
  title: "Prepare lesson",
  assigneeId: "user-123",
  status: "Open|In Progress|Completed",
  dueDate: "2026-06-15",
  createdBy: "user-456",
  createdAt: timestamp
}
```

#### assignments
```
{
  id: "assignment-101",
  title: "AI Project",
  classId: "class-456",
  dueDate: "2026-06-01",
  createdBy: "user-123",
  createdAt: timestamp
}
```

#### enrollments
```
{
  id: "enrollment-202",
  studentId: "user-123",
  classId: "class-456",
  enrolledBy: "user-456",
  createdAt: timestamp
}
```

---

## Role-Based Access Control (RBAC)

### Roles:
- **admin**: Full access to all portal features
- **tutor**: Can create classes, assignments, manage students
- **mentor**: Can mentor students, view assignments
- **student**: Can view classes, complete assignments
- **learner**: Same as student

### Security Rules (Firebase):
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Admin can do anything
    match /{document=**} {
      allow read, write: if getUserData(request.auth.uid).role == 'admin';
    }
    
    // Tutors can manage their classes
    match /classes/{classId} {
      allow read: if request.auth != null;
      allow write: if getUserData(request.auth.uid).role == 'tutor';
    }
    
    // Students can only see their assignments
    match /assignments/{assignmentId} {
      allow read: if request.auth != null;
      allow write: if getUserData(request.auth.uid).role == 'tutor' || getUserData(request.auth.uid).role == 'admin';
    }
  }
  
  function getUserData(uid) {
    return get(/databases/$(database)/documents/users/$(uid)).data;
  }
}
```

---

## Environment Variables (for Node.js backend)

Create `.env`:
```
DATABASE_URL=sqlite:///portal.db
PORT=3000
NODE_ENV=production
JWT_SECRET=your_secret_key_here
```

---

## Deployment Options

### Firebase (Easiest for production)
```bash
npm install -g firebase-tools
firebase login
firebase deploy
```

### Heroku (Node.js backend)
```bash
npm install -g heroku
heroku login
heroku create firsttechhub-portal
git push heroku main
```

### Self-hosted VPS
- Use server like AWS EC2, DigitalOcean
- Deploy Node.js app
- Use nginx for reverse proxy
- SSL with Let's Encrypt

---

## Summary

| Feature | localStorage | Firebase | Node.js |
|---------|--------------|----------|---------|
| Cost | Free | Free tier, then $$ | VPS cost |
| Scalability | Local only | Excellent | Good |
| Setup time | Minutes | 30 mins | 1-2 hours |
| Real-time sync | No | Yes | Polling |
| Offline mode | Yes | Partial | No |
| Best for | Development | Production | Self-hosted |

**Recommendation**: Start with Firebase for production-ready setup with minimal infrastructure overhead.
