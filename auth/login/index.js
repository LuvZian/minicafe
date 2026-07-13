const loginForm = $('#login-form');
const emailInput = $('#email-input');
const passwordInput = $('#password-input');
const roleInput = $('#role-input');
const formMessage = $('#form-message');
const signupLink = $('#signup-link');
const helperText = $('#helper-text');
const roleButtons = $$('[data-role]');

const params = new URLSearchParams(window.location.search);
const requestedRole = params.get('role') === 'admin' ? 'admin' : 'customer';
const nextUrl = params.get('next') || '';

function setRole(role) {
  roleInput.value = role;
  roleButtons.forEach((button) => {
    button.classList.toggle('is-active', button.dataset.role === role);
  });

  if (role === 'admin') {
    emailInput.value = emailInput.value || 'admin@minicafe.local';
    helperText.textContent = 'Default admin account';
    signupLink.textContent = 'admin@minicafe.local / admin1234';
    signupLink.removeAttribute('href');
  } else {
    helperText.textContent = 'New here?';
    signupLink.textContent = 'Create customer account';
    signupLink.href = '/auth/signup/';
  }
}

roleButtons.forEach((button) => {
  button.addEventListener('click', () => {
    formMessage.textContent = '';
    setRole(button.dataset.role);
  });
});

loginForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const result = loginUser(emailInput.value, passwordInput.value);

  if (!result.ok) {
    formMessage.textContent = result.message;
    return;
  }

  if (roleInput.value === 'admin' && result.user.role !== 'admin') {
    logoutUser();
    formMessage.textContent = 'This is not an admin account.';
    return;
  }

  if (roleInput.value === 'customer' && result.user.role === 'admin') {
    window.location.href = '/admin/';
    return;
  }

  window.location.href = nextUrl || getAuthRedirect(result.user, '/my/');
});

setRole(requestedRole);
