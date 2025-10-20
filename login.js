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

  // Form validation (only on login page)
  if (window.location.pathname.includes('login.html')) {
    if (loginForm) {
      loginForm.addEventListener('submit', function(e) {
        e.preventDefault(); // Prevent default form submission

        const emailInput = document.querySelector('input[type="email"]');
        const passwordInput = document.querySelector('input[type="password"]');
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        // Clear previous errors
        document.getElementById('email-error').textContent = '';
        document.getElementById('password-error').textContent = '';

        if (!validateEmail(email)) {
          document.getElementById('email-error').textContent = 'Please enter a valid email address.';
          emailInput.focus();
          return;
        }
        if (!password) {
          document.getElementById('password-error').textContent = 'Please enter your password.';
          passwordInput.focus();
          return;
        }

        // Submit form via fetch to handle response properly
        const formData = new FormData(loginForm);
        fetch('login.php', {
          method: 'POST',
          body: formData
        })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            window.location.href = data.redirect;
          } else {
            if (data.errors.email) {
              document.getElementById('email-error').textContent = data.errors.email;
            }
            if (data.errors.password) {
              document.getElementById('password-error').textContent = data.errors.password;
            }
            if (data.errors.general) {
              alert(data.errors.general);
            }
          }
        })
        .catch(error => {
          alert('An error occurred. Please try again.');
          console.error('Error:', error);
        });
      });
    }
  }

  // Signup form validation
  if (loginForm && window.location.pathname.includes('signup.html')) {
    loginForm.addEventListener('submit', function(e) {
      e.preventDefault(); // Prevent default form submission

      const nameInput = document.querySelector('input[type="text"]');
      const emailInput = document.querySelector('input[type="email"]');
      const passwordInputs = document.querySelectorAll('input[type="password"]');
      const password = passwordInputs[0].value;
      const confirmPassword = passwordInputs[1].value;
      const name = nameInput.value.trim();
      const email = emailInput.value.trim();

      // Clear previous errors
      document.getElementById('name-error').textContent = '';
      document.getElementById('email-error').textContent = '';
      document.getElementById('password-error').textContent = '';
      document.getElementById('confirm-password-error').textContent = '';

      if (!validateName(name)) {
        document.getElementById('name-error').textContent = 'Please enter a valid name (letters and spaces only).';
        nameInput.focus();
        return;
      }

      if (!validateEmail(email)) {
        document.getElementById('email-error').textContent = 'Please enter a valid email address.';
        emailInput.focus();
        return;
      }

      if (password !== confirmPassword) {
        document.getElementById('confirm-password-error').textContent = 'Passwords do not match. Please try again.';
        passwordInputs[0].focus();
        return;
      }

      // Submit form via fetch to handle response properly
      const formData = new FormData(loginForm);
      fetch('signup.php', {
        method: 'POST',
        body: formData
      })
      .then(response => response.json())
        .then(data => {
          if (data.success) {
            window.location.href = data.redirect;
          } else {
            if (data.errors.name) {
              document.getElementById('name-error').textContent = data.errors.name;
            }
            if (data.errors.email) {
              document.getElementById('email-error').textContent = data.errors.email;
            }
            if (data.errors.password) {
              document.getElementById('password-error').textContent = data.errors.password;
            }
            if (data.errors.confirm_password) {
              document.getElementById('confirm-password-error').textContent = data.errors.confirm_password;
            }
            if (data.errors.general) {
              alert(data.errors.general);
            }
          }
        })
      .catch(error => {
        alert('An error occurred. Please try again.');
        console.error('Error:', error);
      });
    });
  }

  // Add event listener for "Get Started" buttons on login and signup pages
  const getStartedButtons = document.querySelectorAll('.join-us button');
  getStartedButtons.forEach(button => {
    button.addEventListener('click', function() {
      alert('Please sign in or sign up to get started.');
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


