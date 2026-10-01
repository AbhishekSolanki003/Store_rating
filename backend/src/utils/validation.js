const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordPattern = /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/;

function validateUserInput({ name, email, address, password }) {
  const errors = {};
  if (!name || name.length < 20 || name.length > 60) errors.name = 'Name must be between 20 and 60 characters';
  if (!email || !emailPattern.test(email)) errors.email = 'Enter a valid email address';
  if (!address || address.length > 400) errors.address = 'Address is required and must be 400 characters or fewer';
  if (password !== undefined && !passwordPattern.test(password)) errors.password = 'Password must be 8-16 characters with an uppercase letter and special character';
  return errors;
}

function validatePassword(password) {
  return passwordPattern.test(password || '');
}

function parsePositiveId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

module.exports = { validateUserInput, validatePassword, parsePositiveId };