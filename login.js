// Validation functions
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validateName(name) {
  return name.trim().length > 0 && /^[a-zA-Z\s]+$/.test(name);
}

// All event listeners
document.addEventListener('DOMContentLoaded', function() {
  const loginForm = document.querySelector('form');
  if (loginForm && window.location.pathname.includes('login.html')) {
    loginForm.addEventListener('submit', function(e) {
      const emailInput = document.querySelector('input[type="email"]');
      const email = emailInput.value.trim();

      if (!validateEmail(email)) {
        e.preventDefault();
        alert('Please enter a valid email address.');
        emailInput.focus();
        return false;
      }
    });
  }

  // Signup form validation
  if (loginForm && window.location.pathname.includes('signup.html')) {
    loginForm.addEventListener('submit', function(e) {
      const nameInput = document.querySelector('input[type="text"]');
      const emailInput = document.querySelector('input[type="email"]');
      const passwordInputs = document.querySelectorAll('input[type="password"]');
      const password = passwordInputs[0].value;
      const confirmPassword = passwordInputs[1].value;
      const name = nameInput.value.trim();
      const email = emailInput.value.trim();

      if (!validateName(name)) {
        e.preventDefault();
        alert('Please enter a valid name (letters and spaces only).');
        nameInput.focus();
        return false;
      }

      if (!validateEmail(email)) {
        e.preventDefault();
        alert('Please enter a valid email address.');
        emailInput.focus();
        return false;
      }

      if (password !== confirmPassword) {
        e.preventDefault();
        alert('Passwords do not match. Please try again.');
        passwordInputs[0].focus();
        return false;
      }
    });
  }

  // Add event listener for "Get Started" buttons on login and signup pages
  const getStartedButtons = document.querySelectorAll('.join-us button');
  getStartedButtons.forEach(button => {
    button.addEventListener('click', function() {
      const emailInput = document.querySelector('input[type="email"]');
      const passwordInput = document.querySelector('input[type="password"]');
      if (!emailInput.value.trim() || !passwordInput.value.trim()) {
        alert('please fill credentials');
      } else {
        alert('Welcome to DocuMint! Redirecting to the main page.');
        window.location.href = 'index.html';
      }
    });
  });
});
