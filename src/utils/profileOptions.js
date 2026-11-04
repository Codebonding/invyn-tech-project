export const GENDERS = [
  ["", "Not specified"],
  ["female", "Female"],
  ["male", "Male"],
  ["non_binary", "Non-binary"],
  ["prefer_not_to_say", "Prefer not to say"],
];

export const ACADEMIC_STATUSES = [
  ["", "Not specified"],
  ["studying", "Currently studying"],
  ["graduated", "Graduated"],
  ["on_break", "On a break"],
  ["other", "Other"],
];

export const EDUCATION_LEVELS = [
  ["", "Select a level"],
  ["high_school", "High school"],
  ["diploma", "Diploma"],
  ["bachelors", "Bachelor's degree"],
  ["masters", "Master's degree"],
  ["doctorate", "Doctorate"],
  ["certification", "Certification"],
  ["other", "Other"],
];

export const labelFor = (options, value) => options.find(([v]) => v === value)?.[1] || "";