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
        e.preventDefault(); // Prevent default form submission

        const emailInput = document.querySelector('input[type="email"]');
        const passwordInput = document.querySelector('input[type="password"]');
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        if (!validateEmail(email)) {
          alert('Please enter a valid email address.');
          emailInput.focus();
          return;
        }
        if (!password) {
          alert('Please enter your password.');
          passwordInput.focus();
          return;
        }

        // Submit form via fetch to handle response properly
        const formData = new FormData(loginForm);
        fetch('login.php', {
          method: 'POST',
          body: formData
        })
        .then(response => response.text())
        .then(data => {
          if (data.includes('<script>')) {
            // Extract and execute the script content in global context
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = data;
            const scriptElement = tempDiv.querySelector('script');
            if (scriptElement) {
              const script = document.createElement('script');
              script.textContent = scriptElement.textContent;
              document.head.appendChild(script);
              document.head.removeChild(script); // Clean up
            }
          } else {
            alert('Server returned invalid response. Check console for details.');
            console.log('Response:', data);
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

      if (!validateName(name)) {
        alert('Please enter a valid name (letters and spaces only).');
        nameInput.focus();
        return;
      }

      if (!validateEmail(email)) {
        alert('Please enter a valid email address.');
        emailInput.focus();
        return;
      }

      if (password !== confirmPassword) {
        alert('Passwords do not match. Please try again.');
        passwordInputs[0].focus();
        return;
      }

      // Submit form via fetch to handle response properly
      const formData = new FormData(loginForm);
      fetch('signup.php', {
        method: 'POST',
        body: formData
      })
      .then(response => response.text())
        .then(data => {
          if (data.includes('<script>')) {
            // Extract and execute the script content in global context
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = data;
            const scriptElement = tempDiv.querySelector('script');
            if (scriptElement) {
              const script = document.createElement('script');
              script.textContent = scriptElement.textContent;
              document.head.appendChild(script);
              document.head.removeChild(script); // Clean up
            }
          } else {
            alert('Server returned invalid response. Check console for details.');
            console.log('Response:', data);
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


