const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateEnrollment({ name = "", email = "", phone = "" }) {
  const errors = {};
  if (!name.trim()) errors.name = "Enter your full name.";
  else if (name.trim().length < 2) errors.name = "Your name must have at least 2 characters.";

  if (!email.trim()) errors.email = "Enter your email address.";
  else if (!EMAIL.test(email.trim())) errors.email = "Enter a valid email address, for example name@example.com.";

  const digits = phone.replace(/[\s\-().]/g, "");
  if (!phone.trim()) errors.phone = "Enter your phone number.";
  else if (!/^\+?\d{7,15}$/.test(digits)) errors.phone = "Enter a valid phone number with 7 to 15 digits. A leading + is allowed.";

  return errors;
}