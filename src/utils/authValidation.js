/**
 * Fast client-side feedback only. The backend (Joi) is the authority and repeats every rule.
 * Keep PASSWORD rules in sync with backend/src/validators/auth.validator.js.
 */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const PASSWORD_HINT = "At least 10 characters with an uppercase letter, a lowercase letter, a number and a special character.";

export function validateLogin({ email = "", password = "" }) {
  const errors = {};
  if (!email.trim()) errors.email = "Enter your email address.";
  else if (!EMAIL.test(email.trim())) errors.email = "Enter a valid email address, for example name@example.com.";
  if (!password) errors.password = "Enter your password.";
  return errors;
}

export function validateRegistration({ name = "", email = "", password = "", confirmPassword = "" }) {
  const errors = {};
  if (!name.trim()) errors.name = "Enter your full name.";
  else if (name.trim().length < 2) errors.name = "Your name must have at least 2 characters.";

  if (!email.trim()) errors.email = "Enter your email address.";
  else if (!EMAIL.test(email.trim())) errors.email = "Enter a valid email address, for example name@example.com.";

  if (!password) errors.password = "Choose a password.";
  else if (password.length < 10) errors.password = "Password must be at least 10 characters long.";
  else if (new TextEncoder().encode(password).length > 72) errors.password = "Password must not be longer than 72 bytes.";
  else if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/[0-9]/.test(password) || !/[^A-Za-z0-9]/.test(password)) {
    errors.password = "Password must include an uppercase letter, a lowercase letter, a number and a special character.";
  }

  if (!confirmPassword) errors.confirmPassword = "Please confirm your password.";
  else if (confirmPassword !== password) errors.confirmPassword = "Passwords do not match.";

  return errors;
}

/**
 * Turns a normalised RTK Query error ({ status, data: { message, errors[] } }) into
 * { fieldErrors, formError } for display. Never shows raw server internals.
 */
export function toFormErrors(error) {
  const fieldErrors = {};
  const data = error?.data;

  if (Array.isArray(data?.errors)) {
    data.errors.forEach(({ field, message }) => {
      if (field && !fieldErrors[field]) fieldErrors[field] = message;
    });
  }

  if (data?.code === "EMAIL_TAKEN") fieldErrors.email = data.message;

  const hasFieldErrors = Object.keys(fieldErrors).length > 0;
  const formError = hasFieldErrors ? null : data?.message || "Something went wrong. Please try again.";
  return { fieldErrors, formError };
}
export function validateSetup({ password = "", confirmPassword = "" }) {
  const found = validateRegistration({ name: "ok", email: "a@b.co", password, confirmPassword });
  const errors = {};
  if (found.password) errors.password = found.password;
  if (found.confirmPassword) errors.confirmPassword = found.confirmPassword;
  return errors;
}
export function validateEmployee({ name = "", email = "" }) {
  const found = validateRegistration({ name, email, password: "Aa1!aaaaaa", confirmPassword: "Aa1!aaaaaa" });
  const errors = {};
  if (found.name) errors.name = found.name;
  if (found.email) errors.email = found.email;
  return errors;
}