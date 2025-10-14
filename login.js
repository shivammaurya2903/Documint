// Validation functions
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validateName(name) {
  return name.trim().length > 0 && /^[a-zA-Z\s]+$/.test(name);
}

const adminUsername = 'admin@gmail.com';
const adminPassword = '123456';



// All event listeners
document.addEventListener('DOMContentLoaded', function() {
  const loginForm = document.querySelector('form');

  // Form validation (only on login page)
  if (window.location.pathname.includes('login.html')) {
    if (loginForm) {
      loginForm.addEventListener('submit', function(e) {
        const emailInput = document.querySelector('input[type="email"]');
        const passwordInput = document.querySelector('input[type="password"]');
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        if (!validateEmail(email)) {
          alert('Please enter a valid email address.');
          emailInput.focus();
          e.preventDefault();
          return;
        }
        if (!password) {
          alert('Please enter your password.');
          passwordInput.focus();
          e.preventDefault();
          return;
        }

        // Allow form to submit to PHP
      });
    }
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
        alert('Please enter a valid name (letters and spaces only).');
        nameInput.focus();
        e.preventDefault();
        return;
      }

      if (!validateEmail(email)) {
        alert('Please enter a valid email address.');
        emailInput.focus();
        e.preventDefault();
        return;
      }

      if (password !== confirmPassword) {
        alert('Passwords do not match. Please try again.');
        passwordInputs[0].focus();
        e.preventDefault();
        return;
      }

      // Allow form to submit to PHP
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
        window.location.href = 'home.html';
      }
    });
  });

  // Google button
  const googleButton = document.querySelector('.google');
  if (googleButton) {
    googleButton.addEventListener('click', function() {
      alert('Google login not implemented yet.');
    });
  }

  // Apple button
  const appleButton = document.querySelector('.apple');
  if (appleButton) {
    appleButton.addEventListener('click', function() {
      alert('Apple login not implemented yet.');
    });
  }
});


