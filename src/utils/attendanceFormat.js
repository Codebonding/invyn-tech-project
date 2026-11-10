export const STATUS_OPTIONS = [
  ["present", "Present"],
  ["absent", "Absent"],
  ["leave", "Leave"],
];

export const statusLabel = (status) => STATUS_OPTIONS.find(([id]) => id === status)?.[1] ?? "Not marked";

export const formatPercent = (value) => `${Number.isInteger(value) ? value : Number(value ?? 0).toFixed(1)}%`;

export const GROUP_OPTIONS = [
  ["course", "Course-wise"],
  ["student", "Student-wise"],
  ["date", "Date-wise"],
  ["employee", "Employee-wise"],
];

/** The API rejects an end date before the start date; this lets the page say so before asking. */
export const dateRangeError = (from, to) => (from && to && to < from ? "The end date cannot be before the start date." : "");

/** Query parameters with every empty filter removed. */
export const cleanParams = (params) =>
  Object.fromEntries(Object.entries(params).filter(([, v]) => v !== "" && v !== null && v !== undefined));