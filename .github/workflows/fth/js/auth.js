const FTBHUB_AUTH_USERS_KEY = 'ftbAuthUsers';
const FTBHUB_AUTH_SESSION_KEY = 'ftbAuthSession';

const defaultAuthUsers = [
  {
    id: 'student-demo',
    name: 'Jordan Blake',
    email: 'student@firsttechhub.com',
    password: 'Student123',
    role: 'Student',
    bio: 'Learning web development fundamentals and improving real-world skills.',
    createdAt: '2026-05-06'
  },
  {
    id: 'tutor-demo',
    name: 'Ava Chen',
    email: 'tutor@firsttechhub.com',
    password: 'Tutor123',
    role: 'Tutor',
    bio: 'Supporting learners through hands-on guidance and mentorship.',
    createdAt: '2026-05-06'
  }
];

function getAuthUsers() {
  try {
    const raw = localStorage.getItem(FTBHUB_AUTH_USERS_KEY);
    if (!raw) {
      return [...defaultAuthUsers];
    }
    return JSON.parse(raw);
  } catch (error) {
    return [...defaultAuthUsers];
  }
}

function saveAuthUsers(users) {
  localStorage.setItem(FTBHUB_AUTH_USERS_KEY, JSON.stringify(users));
}

function getSessionUser() {
  try {
    const raw = localStorage.getItem(FTBHUB_AUTH_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    return null;
  }
}

function setSessionUser(user) {
  localStorage.setItem(FTBHUB_AUTH_SESSION_KEY, JSON.stringify(user));
}

function clearSessionUser() {
  localStorage.removeItem(FTBHUB_AUTH_SESSION_KEY);
}

function findUserByEmail(email) {
  if (!email) return null;
  const normalized = email.trim().toLowerCase();
  return getAuthUsers().find((user) => user.email.toLowerCase() === normalized) || null;
}

function loginUser(email, password) {
  const user = findUserByEmail(email);
  if (!user) {
    return { success: false, message: 'No account found with that email.' };
  }
  if (user.password !== password) {
    return { success: false, message: 'Incorrect password. Please try again.' };
  }
  setSessionUser({ ...user, lastLogin: new Date().toISOString() });
  return { success: true, user };
}

function registerUser(email, password, name, role, userProfile = {}) {
  if (!name || !email || !password || !role) {
    return { success: false, message: 'Please complete every field.' };
  }
  if (findUserByEmail(email)) {
    return { success: false, message: 'An account already exists with that email.' };
  }
  const users = getAuthUsers();
  const newUser = {
    id: `user-${Date.now()}`,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    password: password.trim(),
    role: role.trim(),
    bio: '',
    createdAt: new Date().toISOString(),
    // Merge additional profile data from signup form
    ...userProfile
  };
  users.push(newUser);
  saveAuthUsers(users);
  setSessionUser(newUser);
  return { success: true, user: newUser };
}

function resetPassword(email) {
  const users = getAuthUsers();
  const userIndex = users.findIndex((user) => user.email.toLowerCase() === email.trim().toLowerCase());
  if (userIndex === -1) {
    return { success: false, message: 'No account found with that email.' };
  }
  const newPassword = `Reset${Math.floor(1000 + Math.random() * 9000)}`;
  users[userIndex].password = newPassword;
  saveAuthUsers(users);
  return { success: true, password: newPassword };
}

function updateCurrentUser(updates) {
  const activeUser = getSessionUser();
  if (!activeUser) {
    return { success: false, message: 'No active session found.' };
  }
  const users = getAuthUsers();
  const index = users.findIndex((user) => user.email === activeUser.email);
  if (index === -1) {
    return { success: false, message: 'Account not found.' };
  }
  const current = users[index];
  const updated = { ...current, ...updates, updatedAt: new Date().toISOString() };
  users[index] = updated;
  saveAuthUsers(users);
  setSessionUser(updated);
  return { success: true, user: updated };
}

function showAuthMessage(container, message, type = 'info') {
  if (!container) return;
  container.textContent = message;
  container.style.color = type === 'success' ? '#9beb8d' : type === 'error' ? '#ff8a8a' : '#cbd5f5';
}

function ensureAuthLinks(nav) {
  const contactLink = nav.querySelector('a[href="contact.html"]');
  const loginLink = nav.querySelector('a[href="login.html"]');
  const signupLink = nav.querySelector('a[href="signup.html"]');

  if (!loginLink) {
    const loginEl = document.createElement('a');
    loginEl.href = 'login.html';
    loginEl.textContent = 'Login';
    nav.insertBefore(loginEl, contactLink);
  }
  if (!signupLink) {
    const signupEl = document.createElement('a');
    signupEl.href = 'signup.html';
    signupEl.textContent = 'Sign Up';
    nav.insertBefore(signupEl, contactLink);
  }
}

function updateAuthNavItems() {
  document.querySelectorAll('.site-nav').forEach((nav) => {
    const user = getSessionUser();
    const loginLink = nav.querySelector('a[href="login.html"]');
    const signupLink = nav.querySelector('a[href="signup.html"]');
    const accountLink = nav.querySelector('a[href="account.html"]');
    const logoutLink = nav.querySelector('a[data-logout]');
    const contactLink = nav.querySelector('a[href="contact.html"]');

    if (user) {
      if (loginLink) loginLink.remove();
      if (signupLink) signupLink.remove();
      if (!accountLink) {
        const accountEl = document.createElement('a');
        accountEl.href = 'account.html';
        accountEl.textContent = 'My Account';
        nav.insertBefore(accountEl, contactLink);
      }
      if (!logoutLink) {
        const logoutEl = document.createElement('a');
        logoutEl.href = '#';
        logoutEl.dataset.logout = 'true';
        logoutEl.textContent = 'Logout';
        nav.insertBefore(logoutEl, contactLink);
      }
    } else {
      if (accountLink) accountLink.remove();
      if (logoutLink) logoutLink.remove();
      ensureAuthLinks(nav);
    }

    nav.querySelectorAll('a').forEach((link) => {
      link.classList.remove('active');
      if (window.location.pathname.endsWith(link.getAttribute('href'))) {
        link.classList.add('active');
      }
    });
  });
}

function initAuthNavigation() {
  updateAuthNavItems();
  document.body.addEventListener('click', (event) => {
    const logoutButton = event.target.closest('a[data-logout]');
    if (!logoutButton) return;
    event.preventDefault();
    clearSessionUser();
    updateAuthNavItems();
    window.location.href = 'login.html';
  });
}

function initLoginPage() {
  const form = document.getElementById('loginForm');
  const message = document.getElementById('loginMessage');
  if (!form) return;
  const sessionUser = getSessionUser();
  if (sessionUser) {
    showAuthMessage(message, `Already signed in as ${sessionUser.name}. Redirecting...`, 'success');
    setTimeout(() => {
      window.location.href = 'account.html';
    }, 900);
    return;
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const email = form.email.value.trim();
    const password = form.password.value.trim();
    const result = loginUser(email, password);
    if (!result.success) {
      showAuthMessage(message, result.message, 'error');
      return;
    }
    showAuthMessage(message, 'Welcome back! Redirecting to your account...', 'success');
    updateAuthNavItems();
    setTimeout(() => {
      window.location.href = 'account.html';
    }, 900);
  });
}

function initSignupPage() {
  const form = document.getElementById('signupForm');
  const message = document.getElementById('signupMessage');
  if (!form) return;
  const sessionUser = getSessionUser();
  if (sessionUser) {
    showAuthMessage(message, `You are already signed in as ${sessionUser.name}.`, 'success');
    return;
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const password = form.password.value.trim();
    const confirm = form.confirmPassword.value.trim();
    const role = form.role.value;

    if (password !== confirm) {
      showAuthMessage(message, 'Passwords do not match.', 'error');
      return;
    }

    const result = registerUser({ name, email, password, role });
    if (!result.success) {
      showAuthMessage(message, result.message, 'error');
      return;
    }
    showAuthMessage(message, 'Account created! Redirecting to your dashboard...', 'success');
    updateAuthNavItems();
    setTimeout(() => {
      window.location.href = 'account.html';
    }, 900);
  });
}

function initForgotPasswordPage() {
  const form = document.getElementById('forgotForm');
  const message = document.getElementById('forgotMessage');
  if (!form) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const email = form.email.value.trim();
    const result = resetPassword(email);
    if (!result.success) {
      showAuthMessage(message, result.message, 'error');
      return;
    }
    showAuthMessage(message, `Password reset. Use ${result.password} to sign in now.`, 'success');
    form.reset();
  });
}

function initAccountPage() {
  const form = document.getElementById('accountForm');
  const message = document.getElementById('accountMessage');
  const logoutButton = document.getElementById('logoutButton');
  const sessionUser = getSessionUser();
  if (!form) return;
  if (!sessionUser) {
    window.location.href = 'login.html';
    return;
  }

  const nameInput = form.querySelector('#accountName');
  const emailInput = form.querySelector('#accountEmail');
  const roleInput = form.querySelector('#accountRole');
  const bioInput = form.querySelector('#accountBio');
  const currentPasswordInput = form.querySelector('#accountCurrentPassword');
  const newPasswordInput = form.querySelector('#accountNewPassword');
  const confirmPasswordInput = form.querySelector('#accountConfirmPassword');

  nameInput.value = sessionUser.name || '';
  emailInput.value = sessionUser.email || '';
  roleInput.value = sessionUser.role || 'Student';
  bioInput.value = sessionUser.bio || '';

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const updates = {
      name: nameInput.value.trim(),
      role: roleInput.value,
      bio: bioInput.value.trim()
    };
    const currentPassword = currentPasswordInput.value.trim();
    const newPassword = newPasswordInput.value.trim();
    const confirmPassword = confirmPasswordInput.value.trim();

    if ((currentPassword || newPassword || confirmPassword) && newPassword !== confirmPassword) {
      showAuthMessage(message, 'New passwords do not match.', 'error');
      return;
    }

    if (currentPassword || newPassword || confirmPassword) {
      if (!currentPassword) {
        showAuthMessage(message, 'Enter your current password to change it.', 'error');
        return;
      }
      if (currentPassword !== sessionUser.password) {
        showAuthMessage(message, 'Current password is incorrect.', 'error');
        return;
      }
      if (!newPassword) {
        showAuthMessage(message, 'Enter a new password.', 'error');
        return;
      }
      updates.password = newPassword;
    }

    const result = updateCurrentUser(updates);
    if (!result.success) {
      showAuthMessage(message, result.message, 'error');
      return;
    }
    showAuthMessage(message, 'Account details updated successfully.', 'success');
    clearPasswordFields();
    updateAuthNavItems();
  });

  if (logoutButton) {
    logoutButton.addEventListener('click', (event) => {
      event.preventDefault();
      clearSessionUser();
      updateAuthNavItems();
      window.location.href = 'login.html';
    });
  }

  function clearPasswordFields() {
    currentPasswordInput.value = '';
    newPasswordInput.value = '';
    confirmPasswordInput.value = '';
  }
}

window.addEventListener('DOMContentLoaded', () => {
  initAuthNavigation();
  initLoginPage();
  initSignupPage();
  initForgotPasswordPage();
  initAccountPage();
});
