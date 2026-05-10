const courseForm = document.getElementById('courseForm');
const blogForm = document.getElementById('blogForm');
const courseList = document.getElementById('courseList');
const blogList = document.getElementById('blogList');
const resetButton = document.getElementById('resetData');

function getDefaultData() {
  return window.FTB_DATA;
}

function getSavedData() {
  try {
    const raw = localStorage.getItem('ftbData');
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (error) {
    console.warn('Unable to parse saved data', error);
  }
  return null;
}

function saveData(data) {
  localStorage.setItem('ftbData', JSON.stringify(data));
}

function getAdminData() {
  return getSavedData() || getDefaultData();
}

function renderAdminLists() {
  const data = getAdminData();
  courseList.innerHTML = '';
  blogList.innerHTML = '';

  data.courses.forEach((course, index) => {
    const item = document.createElement('div');
    item.className = 'admin-item';
    item.innerHTML = `
      <strong>${course.title}</strong>
      <p>${course.type} • ${course.duration}</p>
      <button data-index="${index}" class="remove-item">Remove</button>
    `;
    courseList.appendChild(item);
  });

  data.blogPosts.forEach((post, index) => {
    const item = document.createElement('div');
    item.className = 'admin-item';
    item.innerHTML = `
      <strong>${post.title}</strong>
      <p>${post.date}</p>
      <button data-index="${index}" class="remove-blog">Remove</button>
    `;
    blogList.appendChild(item);
  });
}

function addCourse(event) {
  event.preventDefault();
  const formData = new FormData(courseForm);
  const newCourse = {
    title: formData.get('title').trim(),
    description: formData.get('description').trim(),
    duration: formData.get('duration').trim(),
    type: formData.get('type').trim()
  };

  if (!newCourse.title || !newCourse.description || !newCourse.duration || !newCourse.type) {
    return;
  }

  const data = getAdminData();
  data.courses.push(newCourse);
  saveData(data);
  courseForm.reset();
  renderAdminLists();
}

function addBlogPost(event) {
  event.preventDefault();
  const formData = new FormData(blogForm);
  const newPost = {
    title: formData.get('title').trim(),
    excerpt: formData.get('excerpt').trim(),
    date: formData.get('date').trim()
  };

  if (!newPost.title || !newPost.excerpt || !newPost.date) {
    return;
  }

  const data = getAdminData();
  data.blogPosts.unshift(newPost);
  saveData(data);
  blogForm.reset();
  renderAdminLists();
}

function removeCourse(index) {
  const data = getAdminData();
  data.courses.splice(index, 1);
  saveData(data);
  renderAdminLists();
}

function removeBlog(index) {
  const data = getAdminData();
  data.blogPosts.splice(index, 1);
  saveData(data);
  renderAdminLists();
}

function initAdminEvents() {
  if (!courseForm || !blogForm || !courseList || !blogList || !resetButton) return;

  courseForm.addEventListener('submit', addCourse);
  blogForm.addEventListener('submit', addBlogPost);

  courseList.addEventListener('click', (event) => {
    const button = event.target.closest('.remove-item');
    if (!button) return;
    const index = Number(button.dataset.index);
    removeCourse(index);
  });

  blogList.addEventListener('click', (event) => {
    const button = event.target.closest('.remove-blog');
    if (!button) return;
    const index = Number(button.dataset.index);
    removeBlog(index);
  });

  resetButton.addEventListener('click', () => {
    localStorage.removeItem('ftbData');
    renderAdminLists();
    alert('Default content restored. Refresh the site pages to see the reset data.');
  });
}

window.addEventListener('DOMContentLoaded', () => {
  renderAdminLists();
  initAdminEvents();
});
