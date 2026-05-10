// signup-flow.js - Two-step signup form logic

// Country to states mapping
const countryStates = {
  "United States": [
    "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware",
    "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky",
    "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi",
    "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico",
    "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania",
    "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont",
    "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"
  ],
  "Canada": [
    "Alberta", "British Columbia", "Manitoba", "New Brunswick", "Newfoundland and Labrador",
    "Northwest Territories", "Nova Scotia", "Nunavut", "Ontario", "Prince Edward Island",
    "Quebec", "Saskatchewan", "Yukon"
  ],
  "United Kingdom": [
    "England", "Scotland", "Wales", "Northern Ireland"
  ],
  "Australia": [
    "Australian Capital Territory", "New South Wales", "Northern Territory", "Queensland",
    "South Australia", "Tasmania", "Victoria", "Western Australia"
  ],
  "Nigeria": [
    "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno",
    "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT", "Gombe", "Imo",
    "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa",
    "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba",
    "Yobe", "Zamfara"
  ],
  "Ghana": [
    "Greater Accra", "Ashanti", "Central", "Eastern", "Northern", "Upper East", "Upper West",
    "Volta", "Western", "Western North", "Oti", "Bono", "Bono East", "Ahafo", "Savannah"
  ],
  "South Africa": [
    "Eastern Cape", "Free State", "Gauteng", "KwaZulu-Natal", "Limpopo", "Mpumalanga",
    "North West", "Northern Cape", "Western Cape"
  ],
  "Kenya": [
    "Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret", "Thika", "Malindi", "Kitale",
    "Garissa", "Kakamega", "Vihiga", "Bungoma", "Busia", "Siaya", "Kisii", "Nyamira",
    "Kirinyaga", "Murang'a", "Kiambu", "Turkana", "West Pokot", "Samburu", "Trans Nzoia",
    "Uasin Gishu", "Elgeyo-Marakwet", "Nandi", "Baringo", "Laikipia", "Isiolo", "Meru",
    "Tharaka-Nithi", "Embu", "Kitui", "Machakos", "Makueni", "Nyandarua", "Nyeri",
    "Wajir", "Mandera", "Marsabit", "Tana River", "Lamu", "Taita-Taveta", "Kwale", "Kilifi"
  ],
  "India": [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa",
    "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala",
    "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland",
    "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
    "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi"
  ],
  "Pakistan": [
    "Punjab", "Sindh", "Khyber Pakhtunkhwa", "Balochistan", "Gilgit-Baltistan",
    "Azad Jammu and Kashmir", "Islamabad Capital Territory"
  ],
  "Singapore": ["Singapore"],
  "Philippines": [
    "Metro Manila", "Cordillera Administrative Region", "Ilocos Region", "Cagayan Valley",
    "Central Luzon", "CALABARZON", "MIMAROPA", "Bicol Region", "Western Visayas",
    "Central Visayas", "Eastern Visayas", "Zamboanga Peninsula", "Northern Mindanao",
    "Davao Region", "SOCCSKSARGEN", "Caraga", "Bangsamoro"
  ],
  "Germany": [
    "Baden-Württemberg", "Bavaria", "Berlin", "Brandenburg", "Bremen", "Hamburg",
    "Hesse", "Lower Saxony", "Mecklenburg-Vorpommern", "North Rhine-Westphalia",
    "Rhineland-Palatinate", "Saarland", "Saxony", "Saxony-Anhalt", "Schleswig-Holstein", "Thuringia"
  ],
  "France": [
    "Auvergne-Rhône-Alpes", "Bourgogne-Franche-Comté", "Brittany", "Centre-Val de Loire",
    "Corsica", "Grand Est", "Hauts-de-France", "Île-de-France", "Normandy", "Nouvelle-Aquitaine",
    "Occitanie", "Pays de la Loire", "Provence-Alpes-Côte d'Azur"
  ],
  "Spain": [
    "Andalusia", "Aragon", "Asturias", "Balearic Islands", "Basque Country", "Canary Islands",
    "Cantabria", "Castile and León", "Castile-La Mancha", "Catalonia", "Extremadura",
    "Galicia", "La Rioja", "Madrid", "Murcia", "Navarre", "Valencia"
  ],
  "Italy": [
    "Abruzzo", "Aosta Valley", "Apulia", "Basilicata", "Calabria", "Campania", "Emilia-Romagna",
    "Friuli-Venezia Giulia", "Lazio", "Liguria", "Lombardy", "Marche", "Molise", "Piedmont",
    "Sardinia", "Sicily", "South Tyrol", "Trentino", "Tuscany", "Umbria", "Veneto"
  ],
  "Brazil": [
    "Acre", "Alagoas", "Amapá", "Amazonas", "Bahia", "Ceará", "Distrito Federal", "Espírito Santo",
    "Goiás", "Maranhão", "Mato Grosso", "Mato Grosso do Sul", "Minas Gerais", "Pará", "Paraíba",
    "Paraná", "Pernambuco", "Piauí", "Rio de Janeiro", "Rio Grande do Norte", "Rio Grande do Sul",
    "Rondônia", "Roraima", "Santa Catarina", "São Paulo", "Sergipe", "Tocantins"
  ],
  "Mexico": [
    "Aguascalientes", "Baja California", "Baja California Sur", "Campeche", "Chiapas", "Chihuahua",
    "Coahuila", "Colima", "Durango", "Guanajuato", "Guerrero", "Hidalgo", "Jalisco", "Mexico City",
    "Michoacán", "Morelos", "Nayarit", "Nuevo León", "Oaxaca", "Puebla", "Querétaro", "Quintana Roo",
    "San Luis Potosí", "Sinaloa", "Sonora", "Tabasco", "Tamaulipas", "Tlaxcala", "Veracruz", "Yucatán", "Zacatecas"
  ],
  "New Zealand": [
    "Auckland", "Bay of Plenty", "Canterbury", "Gisborne", "Hawke's Bay", "Manawatu-Whanganui",
    "Marlborough", "Nelson", "Northland", "Otago", "Southland", "Taranaki", "Tasman", "Waikato", "Wellington", "West Coast"
  ]
};

// DOM elements
let currentStep = 1;
const step1 = document.getElementById('step1');
const step2 = document.getElementById('step2');
const formTitle = document.getElementById('formTitle');
const formDesc = document.getElementById('formDesc');
const progressFill = document.getElementById('progressFill');
const progressStep = document.getElementById('progressStep');
const heroSubtitle = document.getElementById('heroSubtitle');
const step1Message = document.getElementById('step1Message');
const step2Message = document.getElementById('step2Message');

// Initialize form
document.addEventListener('DOMContentLoaded', function() {
  updateStates();
  setupRoleBasedFields();
  setupFormValidation();
});

// Update states dropdown based on country selection
function updateStates() {
  const countrySelect = document.getElementById('country');
  const stateSelect = document.getElementById('state');
  const selectedCountry = countrySelect.value;

  // Clear current options
  stateSelect.innerHTML = '<option value="">Select a state/city</option>';

  // Add new options if country has states
  if (selectedCountry && countryStates[selectedCountry]) {
    countryStates[selectedCountry].forEach(state => {
      const option = document.createElement('option');
      option.value = state;
      option.textContent = state;
      stateSelect.appendChild(option);
    });
  }
}

// Toggle between age and category input
function toggleAgeCategory() {
  const ageType = document.querySelector('input[name="ageType"]:checked').value;
  const ageInput = document.getElementById('ageInput');
  const categoryInput = document.getElementById('categoryInput');

  if (ageType === 'age') {
    ageInput.style.display = 'block';
    categoryInput.style.display = 'none';
    document.getElementById('age').required = true;
    document.getElementById('category').required = false;
  } else {
    ageInput.style.display = 'none';
    categoryInput.style.display = 'block';
    document.getElementById('age').required = false;
    document.getElementById('category').required = true;
  }
}

// Setup role-based field visibility
function setupRoleBasedFields() {
  const roleRadios = document.querySelectorAll('input[name="role"]');

  roleRadios.forEach(radio => {
    radio.addEventListener('change', function() {
      updateRoleBasedFields(this.value);
    });
  });

  // Set initial state
  const checkedRole = document.querySelector('input[name="role"]:checked');
  if (checkedRole) {
    updateRoleBasedFields(checkedRole.value);
  }
}

// Update which fields are shown based on selected role
function updateRoleBasedFields(role) {
  const studentFields = document.getElementById('studentFields');
  const parentFields = document.getElementById('parentFields');
  const tutorFields = document.getElementById('tutorFields');

  // Hide all role-specific fields first
  studentFields.style.display = 'none';
  parentFields.style.display = 'none';
  tutorFields.style.display = 'none';

  // Remove required attributes
  const studentInputs = studentFields.querySelectorAll('input, select, textarea');
  const parentInputs = parentFields.querySelectorAll('input, select, textarea');
  const tutorInputs = tutorFields.querySelectorAll('input, select, textarea');

  [...studentInputs, ...parentInputs, ...tutorInputs].forEach(input => {
    input.required = false;
  });

  // Show relevant fields and make them required
  switch(role) {
    case 'Student':
    case 'Learner':
      studentFields.style.display = 'block';
      studentFields.querySelectorAll('input, select').forEach(input => {
        if (input.id !== 'childName' && input.id !== 'childAge' && input.id !== 'parentPhone') {
          input.required = true;
        }
      });
      break;

    case 'Parent':
      parentFields.style.display = 'block';
      parentFields.querySelectorAll('input').forEach(input => {
        input.required = true;
      });
      break;

    case 'Tutor':
    case 'Mentor':
      tutorFields.style.display = 'block';
      tutorFields.querySelectorAll('input, select, textarea').forEach(input => {
        if (input.id !== 'portfolioUrl') { // Portfolio is optional
          input.required = true;
        }
      });
      break;
  }
}

// Proceed to step 2
function proceedToStep2() {
  // Validate step 1
  const requiredFields = [
    'firstName', 'lastName', 'email', 'phone', 'password', 'confirmPassword'
  ];

  let isValid = true;
  let firstInvalidField = null;

  // Check required fields
  requiredFields.forEach(fieldId => {
    const field = document.getElementById(fieldId);
    if (!field.value.trim()) {
      field.classList.add('error');
      if (!firstInvalidField) firstInvalidField = field;
      isValid = false;
    } else {
      field.classList.remove('error');
    }
  });

  // Check password match
  const password = document.getElementById('password');
  const confirmPassword = document.getElementById('confirmPassword');
  if (password.value !== confirmPassword.value) {
    confirmPassword.classList.add('error');
    step1Message.textContent = 'Passwords do not match.';
    step1Message.style.color = 'var(--error)';
    return;
  }

  // Check role selection
  const selectedRole = document.querySelector('input[name="role"]:checked');
  if (!selectedRole) {
    step1Message.textContent = 'Please select your role.';
    step1Message.style.color = 'var(--error)';
    return;
  }

  // Check email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(document.getElementById('email').value)) {
    document.getElementById('email').classList.add('error');
    step1Message.textContent = 'Please enter a valid email address.';
    step1Message.style.color = 'var(--error)';
    return;
  }

  if (!isValid) {
    step1Message.textContent = 'Please fill in all required fields.';
    step1Message.style.color = 'var(--error)';
    if (firstInvalidField) firstInvalidField.focus();
    return;
  }

  // If validation passes, proceed to step 2
  step1Message.textContent = '';
  currentStep = 2;
  updateUI();
}

// Go back to step 1
function backToStep1() {
  currentStep = 1;
  updateUI();
  step2Message.textContent = '';
}

// Update UI based on current step
function updateUI() {
  if (currentStep === 1) {
    step1.style.display = 'block';
    step2.style.display = 'none';
    formTitle.textContent = 'Step 1: Basic Information';
    formDesc.textContent = 'Let\'s get started with your account details.';
    progressFill.style.width = '50%';
    progressStep.textContent = '1';
    heroSubtitle.textContent = 'Sign up to access training resources, manage your courses, and connect with mentors.';
  } else {
    step1.style.display = 'none';
    step2.style.display = 'block';
    formTitle.textContent = 'Step 2: Personal Details';
    formDesc.textContent = 'Tell us more about yourself to personalize your experience.';
    progressFill.style.width = '100%';
    progressStep.textContent = '2';
    heroSubtitle.textContent = 'Almost there! Complete your profile to get started.';
  }
}

// Setup form validation
function setupFormValidation() {
  const form = document.getElementById('signupForm');

  form.addEventListener('submit', function(e) {
    e.preventDefault();

    // Validate step 2
    const requiredFields = [
      'age', 'category', 'experience', 'learningGoal', 'source', 'termsAccept', 'privacyAccept'
    ];

    let isValid = true;
    let firstInvalidField = null;

    // Check age/category
    const ageType = document.querySelector('input[name="ageType"]:checked').value;
    if (ageType === 'age') {
      const age = document.getElementById('age');
      if (!age.value || age.value < 4 || age.value > 100) {
        age.classList.add('error');
        if (!firstInvalidField) firstInvalidField = age;
        isValid = false;
      }
    } else {
      const category = document.getElementById('category');
      if (!category.value) {
        category.classList.add('error');
        if (!firstInvalidField) firstInvalidField = category;
        isValid = false;
      }
    }

    // Check interests (at least one)
    const interests = document.querySelectorAll('input[name="interests"]:checked');
    if (interests.length === 0) {
      step2Message.textContent = 'Please select at least one learning interest.';
      step2Message.style.color = 'var(--error)';
      return;
    }

    // Check other required fields
    ['experience', 'learningGoal', 'source'].forEach(fieldName => {
      const field = document.querySelector(`input[name="${fieldName}"]:checked`);
      if (!field) {
        isValid = false;
        step2Message.textContent = 'Please fill in all required fields.';
        step2Message.style.color = 'var(--error)';
      }
    });

    // Check checkboxes
    if (!document.querySelector('input[name="termsAccept"]').checked ||
        !document.querySelector('input[name="privacyAccept"]').checked) {
      step2Message.textContent = 'Please accept the terms and privacy policy.';
      step2Message.style.color = 'var(--error)';
      return;
    }

    if (!isValid) {
      if (firstInvalidField) firstInvalidField.focus();
      return;
    }

    // If validation passes, submit the form
    submitForm();
  });
}

// Submit form data
function submitForm() {
  // Collect form data
  const formData = new FormData(document.getElementById('signupForm'));
  const userData = {};

  // Convert FormData to object
  for (let [key, value] of formData.entries()) {
    if (key === 'interests') {
      if (!userData.interests) userData.interests = [];
      userData.interests.push(value);
    } else {
      userData[key] = value;
    }
  }

  // Get selected role
  const selectedRole = document.querySelector('input[name="role"]:checked');
  userData.role = selectedRole ? selectedRole.value : '';

  // Get age type
  const ageType = document.querySelector('input[name="ageType"]:checked');
  userData.ageType = ageType ? ageType.value : 'age';

  // Show loading state
  const submitBtn = document.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  submitBtn.textContent = 'Creating Account...';
  submitBtn.disabled = true;

  // Simulate API call (replace with actual registration)
  setTimeout(() => {
    try {
      // Call the registration function from auth.js
      registerUser(userData.email, userData.password, `${userData.firstName} ${userData.lastName}`, userData.role, userData);

      step2Message.textContent = 'Account created successfully! Redirecting to login...';
      step2Message.style.color = 'var(--success)';

      // Redirect to login after success
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 2000);

    } catch (error) {
      step2Message.textContent = 'Registration failed. Please try again.';
      step2Message.style.color = 'var(--error)';
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  }, 1000);
}

// Add error styling
const style = document.createElement('style');
style.textContent = `
  .form-group input.error,
  .form-group select.error,
  .form-group textarea.error {
    border-color: var(--error);
    background: rgba(228, 76, 60, 0.08);
  }

  .form-group input.error:focus,
  .form-group select.error:focus,
  .form-group textarea.error:focus {
    box-shadow: 0 0 0 3px rgba(228, 76, 60, 0.1);
  }
`;
document.head.appendChild(style);