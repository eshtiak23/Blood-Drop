/**
 * validate.js — Shared form validation utilities
 *
 * Reusable validators for all forms in the app.
 * Each validator returns null if valid, or an error message string.
 */

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const BD_PHONE_REGEX = /^01[3-9]\d{8}$/;

export function validateName(value) {
  if (!value || !value.trim()) return "Name is required";
  if (value.trim().length < 2) return "Name must be at least 2 characters";
  if (value.trim().length > 50) return "Name must be at most 50 characters";
  if (!/^[a-zA-Z\s.'-]+$/.test(value.trim())) return "Name can only contain letters, spaces, dots, hyphens";
  return null;
}

export function validateEmail(value) {
  if (!value || !value.trim()) return "Email is required";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) return "Enter a valid email address";
  return null;
}

export function validatePassword(value) {
  if (!value) return "Password is required";
  if (value.length < 6) return "Password must be at least 6 characters";
  if (value.length > 128) return "Password must be at most 128 characters";
  return null;
}

export function validatePhone(value) {
  if (!value || !value.trim()) return "Phone number is required";
  const cleaned = value.replace(/[\s-]/g, "");
  if (!BD_PHONE_REGEX.test(cleaned)) return "Enter a valid BD phone (e.g., 01712345678)";
  return null;
}

export function validateAge(value) {
  const num = Number(value);
  if (!value && value !== 0) return "Age is required";
  if (isNaN(num) || !Number.isInteger(num)) return "Age must be a whole number";
  if (num < 18) return "You must be at least 18 years old";
  if (num > 65) return "Age cannot exceed 65";
  return null;
}

export function validateBloodGroup(value) {
  if (!value) return "Blood group is required";
  if (!BLOOD_GROUPS.includes(value)) return "Select a valid blood group";
  return null;
}

export function validateDistrict(value) {
  if (!value) return "District is required";
  return null;
}

export function validateArea(value) {
  if (!value) return "Area is required";
  return null;
}

export function validateRequired(value, fieldName) {
  if (!value || (typeof value === "string" && !value.trim())) return `${fieldName} is required`;
  return null;
}

export function validateMinLength(value, min, fieldName) {
  if (value && value.length < min) return `${fieldName} must be at least ${min} characters`;
  return null;
}

export function validateMaxLength(value, max, fieldName) {
  if (value && value.length > max) return `${fieldName} must be at most ${max} characters`;
  return null;
}

export function validateNumber(value, min, max, fieldName) {
  const num = Number(value);
  if (value === "" || value === null || value === undefined) return `${fieldName} is required`;
  if (isNaN(num)) return `${fieldName} must be a number`;
  if (min !== undefined && num < min) return `${fieldName} must be at least ${min}`;
  if (max !== undefined && num > max) return `${fieldName} must be at most ${max}`;
  return null;
}

/**
 * Validate the registration form.
 * Returns { valid: true } or { valid: false, errors: { field: message } }
 */
export function validateRegisterForm(form) {
  const errors = {};

  const nameErr = validateName(form.name);
  if (nameErr) errors.name = nameErr;

  const emailErr = validateEmail(form.email);
  if (emailErr) errors.email = emailErr;

  const passwordErr = validatePassword(form.password);
  if (passwordErr) errors.password = passwordErr;

  if (form.password !== form.confirmPassword) errors.confirmPassword = "Passwords do not match";

  const phoneErr = validatePhone(form.phone);
  if (phoneErr) errors.phone = phoneErr;

  const ageErr = validateAge(form.age);
  if (ageErr) errors.age = ageErr;

  const bloodErr = validateBloodGroup(form.bloodGroup);
  if (bloodErr) errors.bloodGroup = bloodErr;

  if (!form.lastDonationDate) errors.lastDonationDate = "Last donation date is required";

  const districtErr = validateDistrict(form.district);
  if (districtErr) errors.district = districtErr;

  const areaErr = validateArea(form.area);
  if (areaErr) errors.area = areaErr;

  return { valid: Object.keys(errors).length === 0, errors };
}

/**
 * Validate the create request form.
 */
export function validateRequestForm(form) {
  const errors = {};

  const patientErr = validateName(form.patientName);
  if (patientErr) errors.patientName = patientErr.replace("Name", "Patient name");

  const hospitalErr = validateRequired(form.hospital, "Hospital");
  if (hospitalErr) errors.hospital = hospitalErr;
  else if (form.hospital.length > 100) errors.hospital = "Hospital name must be at most 100 characters";

  const bloodErr = validateBloodGroup(form.patientBloodGroup);
  if (bloodErr) errors.patientBloodGroup = bloodErr;

  const unitsErr = validateNumber(form.unitsRequired, 1, 10, "Units required");
  if (unitsErr) errors.unitsRequired = unitsErr;

  if (!form.urgency) errors.urgency = "Urgency is required";

  if (!form.dateNeeded) errors.dateNeeded = "Date needed is required";

  const phoneErr = validatePhone(form.contactNumber);
  if (phoneErr) errors.contactNumber = phoneErr;

  const districtErr = validateDistrict(form.district);
  if (districtErr) errors.district = districtErr;

  const areaErr = validateArea(form.area);
  if (areaErr) errors.area = areaErr;

  return { valid: Object.keys(errors).length === 0, errors };
}
