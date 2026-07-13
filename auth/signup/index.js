const signupForm = $('#signup-form');
const nameInput = $('#name-input');
const emailInput = $('#email-input');
const passwordInput = $('#password-input');
const formMessage = $('#form-message');

signupForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const result = registerUser({
    name: nameInput.value,
    email: emailInput.value,
    password: passwordInput.value,
    role: 'customer'
  });

  if (!result.ok) {
    formMessage.textContent = result.message;
    return;
  }

  window.location.href = '/my/';
});
