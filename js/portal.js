// Portal Script - Role-based access with Firebase backend

const PORTAL_AUTH_GATE = document.getElementById('portalAuthGate');
const PORTAL_CONTENT = document.getElementById('portalContent');
const ADMIN_DASHBOARD = document.getElementById('adminDashboard');
const LEARNER_DASHBOARD = document.getElementById('learnerDashboard');
const TUTOR_DASHBOARD = document.getElementById('tutorDashboard');
const ROLE_GREETING = document.getElementById('roleGreeting');
const SYNC_STATUS = document.getElementById('syncStatus');

let currentUser = null;
let userRole = null;

// Check authentication on page load
window.addEventListener('DOMContentLoaded', async () => {
  const sessionUser = getSessionUser();

  if (!sessionUser) {
    showAuthGate();
    return;
  }

  currentUser = sessionUser;
  userRole = sessionUser.role?.toLowerCase() || 'student';
  showPortalContent();
  initPortalUI();
  await loadPortalData();
});

function showAuthGate() {
  if (PORTAL_AUTH_GATE) PORTAL_AUTH_GATE.style.display = 'block';
  if (PORTAL_CONTENT) PORTAL_CONTENT.style.display = 'none';
}

function showPortalContent() {
  if (PORTAL_AUTH_GATE) PORTAL_AUTH_GATE.style.display = 'none';
  if (PORTAL_CONTENT) PORTAL_CONTENT.style.display = 'block';
  if (ROLE_GREETING) {
    ROLE_GREETING.textContent = `Welcome, ${currentUser.name}! (${userRole.charAt(0).toUpperCase() + userRole.slice(1)})`;
  }
}

function showRoleBasedDashboard() {
  if (ADMIN_DASHBOARD) ADMIN_DASHBOARD.style.display = 'none';
  if (LEARNER_DASHBOARD) LEARNER_DASHBOARD.style.display = 'none';
  if (TUTOR_DASHBOARD) TUTOR_DASHBOARD.style.display = 'none';

  if (userRole === 'admin') {
    if (ADMIN_DASHBOARD) ADMIN_DASHBOARD.style.display = 'block';
  } else if (['student', 'learner'].includes(userRole)) {
    if (LEARNER_DASHBOARD) LEARNER_DASHBOARD.style.display = 'block';
  } else if (['tutor', 'mentor'].includes(userRole)) {
    if (TUTOR_DASHBOARD) TUTOR_DASHBOARD.style.display = 'block';
  }
}

async function loadPortalData() {
  try {
    if (userRole === 'admin') {
      await loadAdminData();
    } else if (['student', 'learner'].includes(userRole)) {
      await loadLearnerData();
    } else if (['tutor', 'mentor'].includes(userRole)) {
      await loadTutorData();
    }
    updateSyncStatus('✓ Synced with cloud');
  } catch (error) {
    console.error('Error loading portal data:', error);
    updateSyncStatus('⚠ Sync failed - using local data');
  }

  showRoleBasedDashboard();
}

function getDefaultPortalData() {
  return {
    classes: [
      { id: 'class-1', title: 'AI Skills Mastery', instructor: 'Ava Chen', schedule: 'Tue/Thu 4pm' },
      { id: 'class-2', title: 'Children\'s Computer Proficiency', instructor: 'Noah Patel', schedule: 'Mon/Wed 3pm' }
    ],
    tasks: [],
    assignments: [],
    enrollments: []
  };
}

function populateClassSelects(classes) {
  const selectors = [
    document.getElementById('assignmentClass'),
    document.getElementById('tutorAssignmentClass'),
    document.getElementById('enrollClass')
  ];

  selectors.forEach(selector => {
    if (selector) {
      selector.innerHTML = '<option value="">Select class</option>';
      classes.forEach(cls => {
        const option = document.createElement('option');
        option.value = cls.id;
        option.textContent = cls.title || cls.name;
        selector.appendChild(option);
      });
    }
  });
}

async function loadAdminData() {
  let classes = [];
  let tasks = [];
  let assignments = [];

  if (db) {
    classes = await getDocuments('classes');
    tasks = await getDocuments('tasks');
    assignments = await getDocuments('assignments');
  } else {
    const data = JSON.parse(localStorage.getItem('portalData') || JSON.stringify(getDefaultPortalData()));
    classes = data.classes || [];
    tasks = data.tasks || [];
    assignments = data.assignments || [];
  }

  populateClassSelects(classes);
  setupAdminForms(classes);
  
  document.getElementById('countClasses').textContent = classes.length;
  document.getElementById('countTasks').textContent = tasks.length;
  document.getElementById('countAssignments').textContent = assignments.length;

  renderList('classesList', classes);
  renderList('tasksList', tasks);
  renderList('assignmentsList', assignments);
}

async function loadLearnerData() {
  const myClasses = []; // Would fetch user's enrolled classes
  const myTasks = []; // Would fetch assigned tasks
  const myAssignments = []; // Would fetch assigned assignments

  if (document.getElementById('myClasses')) {
    document.getElementById('myClasses').innerHTML = '<p class="small-note">Loading your classes...</p>';
  }
  if (document.getElementById('myTasks')) {
    document.getElementById('myTasks').innerHTML = '<p class="small-note">No tasks assigned yet.</p>';
  }
  if (document.getElementById('myAssignments')) {
    document.getElementById('myAssignments').innerHTML = '<p class="small-note">No assignments yet.</p>';
  }
}

async function loadTutorData() {
  let classes = [];

  if (db) {
    classes = await getDocuments('classes');
  } else {
    const data = JSON.parse(localStorage.getItem('portalData') || JSON.stringify(getDefaultPortalData()));
    classes = data.classes || [];
  }

  populateClassSelects(classes);
  setupTutorForms();

  if (document.getElementById('myStudents')) {
    document.getElementById('myStudents').innerHTML = '<p class="small-note">Loading your students...</p>';
  }
}

function setupAdminForms(classes) {
  const classForm = document.getElementById('classForm');
  const taskForm = document.getElementById('taskForm');
  const assignmentForm = document.getElementById('assignmentForm');

  if (classForm) {
    classForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(classForm);
      const newClass = {
        title: formData.get('title'),
        instructor: formData.get('instructor'),
        schedule: formData.get('schedule')
      };

      if (db) {
        await addDocument('classes', newClass);
      } else {
        const data = JSON.parse(localStorage.getItem('portalData') || JSON.stringify(getDefaultPortalData()));
        data.classes.push({ id: `class-${Date.now()}`, ...newClass });
        localStorage.setItem('portalData', JSON.stringify(data));
      }

      classForm.reset();
      await loadAdminData();
    });
  }

  if (taskForm) {
    taskForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(taskForm);
      const newTask = {
        title: formData.get('title'),
        assigneeId: formData.get('assigneeId'),
        status: formData.get('status')
      };

      if (db) {
        await addDocument('tasks', newTask);
      } else {
        const data = JSON.parse(localStorage.getItem('portalData') || JSON.stringify(getDefaultPortalData()));
        data.tasks.push({ id: `task-${Date.now()}`, ...newTask });
        localStorage.setItem('portalData', JSON.stringify(data));
      }

      taskForm.reset();
      await loadAdminData();
    });
  }

  if (assignmentForm) {
    assignmentForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(assignmentForm);
      const newAssignment = {
        title: formData.get('title'),
        classId: formData.get('classId'),
        dueDate: formData.get('dueDate')
      };

      if (db) {
        await addDocument('assignments', newAssignment);
      } else {
        const data = JSON.parse(localStorage.getItem('portalData') || JSON.stringify(getDefaultPortalData()));
        data.assignments.push({ id: `assignment-${Date.now()}`, ...newAssignment });
        localStorage.setItem('portalData', JSON.stringify(data));
      }

      assignmentForm.reset();
      await loadAdminData();
    });
  }
}

function setupTutorForms() {
  const enrollForm = document.getElementById('enrollForm');
  const tutorAssignmentForm = document.getElementById('tutorAssignmentForm');

  if (enrollForm) {
    enrollForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(enrollForm);
      const enrollment = {
        studentId: formData.get('studentId'),
        classId: formData.get('classId')
      };

      if (db) {
        await addDocument('enrollments', enrollment);
      } else {
        const data = JSON.parse(localStorage.getItem('portalData') || JSON.stringify(getDefaultPortalData()));
        data.enrollments.push({ id: `enrollment-${Date.now()}`, ...enrollment });
        localStorage.setItem('portalData', JSON.stringify(data));
      }

      enrollForm.reset();
      alert('Student enrolled successfully!');
      await loadTutorData();
    });
  }

  if (tutorAssignmentForm) {
    tutorAssignmentForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(tutorAssignmentForm);
      const newAssignment = {
        title: formData.get('title'),
        classId: formData.get('classId'),
        dueDate: formData.get('dueDate')
      };

      if (db) {
        await addDocument('assignments', newAssignment);
      } else {
        const data = JSON.parse(localStorage.getItem('portalData') || JSON.stringify(getDefaultPortalData()));
        data.assignments.push({ id: `assignment-${Date.now()}`, ...newAssignment });
        localStorage.setItem('portalData', JSON.stringify(data));
      }

      tutorAssignmentForm.reset();
      alert('Assignment created successfully!');
    });
  }
}

function renderList(elementId, items) {
  const element = document.getElementById(elementId);
  if (!element) return;

  if (!items || items.length === 0) {
    element.innerHTML = '<p class="small-note">No items yet.</p>';
    return;
  }

  element.innerHTML = items
    .map((item) => `
    <div class="portal-item">
      <div>
        <strong>${item.title || item.name}</strong>
        <p>${item.schedule || item.status || item.dueDate || item.instructor || ''}</p>
      </div>
    </div>
  `)
    .join('');
}

function initPortalUI() {
  // Additional UI initialization
}

function updateSyncStatus(message) {
  if (SYNC_STATUS) {
    SYNC_STATUS.textContent = message;
  }
}
