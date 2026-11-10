/** All money in the UI is whole paise (integers). Parsing and formatting never use floating-point arithmetic. */
export const formatMinor = (minor, currency = "INR") => {
  if (minor === null || minor === undefined) return "—";
  const abs = Math.abs(minor);
  const rupees = Math.trunc(abs / 100);
  const paise = String(abs % 100).padStart(2, "0");
  const symbol = currency === "INR" ? "₹" : `${currency} `;
  return `${minor < 0 ? "-" : ""}${symbol}${rupees.toLocaleString("en-IN")}.${paise}`;
};

/** "1234.5" -> 123450, or null when it is not a valid amount. */
export const parseRupees = (text) => {
  const m = /^(\d{1,12})(?:\.(\d{1,2}))?$/.exec(String(text ?? "").trim());
  return m ? Number(m[1]) * 100 + Number((m[2] || "").padEnd(2, "0") || 0) : null;
};

export const FEE_STATUSES = [["unpaid", "Unpaid"], ["partially_paid", "Partially paid"], ["paid", "Paid"], ["overdue", "Overdue"], ["cancelled", "Cancelled"]];
export const PAYMENT_STATUSES = [["pending", "Pending"], ["success", "Successful"], ["failed", "Failed"], ["cancelled", "Cancelled"], ["refunded", "Refunded"]];
export const METHODS = [["cash", "Cash"], ["bank_transfer", "Bank transfer"], ["upi", "UPI"], ["cheque", "Cheque"], ["other", "Other"]];

const LABELS = { ...Object.fromEntries(FEE_STATUSES), ...Object.fromEntries(PAYMENT_STATUSES), partially_refunded: "Partially refunded", online: "Online" };
export const statusLabel = (s) => LABELS[s] || s;
export const methodLabel = (m) => (m === "online" ? "Online" : Object.fromEntries(METHODS)[m] || m);

export const GROUPS = [["course", "By course"], ["student", "By student"], ["status", "By status"], ["date", "By collection date"]];

/** A fresh idempotency key: the same key is reused when a request is retried, so a double click cannot pay twice. */
export const newIdempotencyKey = () =>
  (globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : `${Date.now()}${Math.random().toString(36).slice(2)}`).replace(/[^A-Za-z0-9_-]/g, "").padEnd(8, "0");

export const dateRangeError = (from, to) => (from && to && to < from ? "The end date cannot be before the start date." : "");
export const cleanParams = (p) => Object.fromEntries(Object.entries(p).filter(([, v]) => v !== "" && v !== null && v !== undefined));

/** Manual payment form. Returns { errors, amountMinor }. The server re-checks everything. */
export function validateManualPayment(v, outstandingMinor) {
  const errors = {};
  const amountMinor = parseRupees(v.amount);
  if (amountMinor === null || amountMinor < 1) errors.amount = "Enter an amount such as 2500 or 2500.50.";
  else if (amountMinor > outstandingMinor) errors.amount = `The amount is more than the outstanding balance (${formatMinor(outstandingMinor)}).`;
  if (!v.method) errors.method = "Choose a payment method.";
  const ref = String(v.externalReference ?? "").trim();
  if (v.method && v.method !== "cash" && ref.length < 3) errors.externalReference = "Enter the transaction or reference number.";
  else if (ref && !/^[A-Za-z0-9 ./_-]{1,60}$/.test(ref)) errors.externalReference = "Use letters, numbers, spaces and . / _ - only.";
  if (!v.paymentDate) errors.paymentDate = "Choose the payment date.";
  else if (v.paymentDate > new Date().toISOString().slice(0, 10)) errors.paymentDate = "The payment date cannot be in the future.";
  if (String(v.remarks ?? "").length > 255) errors.remarks = "Remarks must be 255 characters or fewer.";
  return { errors, amountMinor };
}

export function validateRefund(v, refundableMinor) {
  const errors = {};
  const amountMinor = parseRupees(v.amount);
  if (amountMinor === null || amountMinor < 1) errors.amount = "Enter an amount such as 500 or 500.50.";
  else if (amountMinor > refundableMinor) errors.amount = `At most ${formatMinor(refundableMinor)} can be refunded.`;
  if (String(v.reason ?? "").trim().length < 5) errors.reason = "Give a reason (at least 5 characters).";
  return { errors, amountMinor };
}

export function validateStructure(v) {
  const errors = {};
  const fee = parseRupees(v.courseFee); const discount = parseRupees(v.discount || "0"); const extra = parseRupees(v.additional || "0");
  if (!v.courseId) errors.courseId = "Choose a course.";
  if (fee === null) errors.courseFee = "Enter the course fee, such as 45000.";
  if (discount === null) errors.discount = "Enter a valid discount.";
  else if (fee !== null && discount > fee) errors.discount = "The discount cannot be more than the course fee.";
  if (extra === null) errors.additional = "Enter valid additional charges.";
  return { errors, courseFeeMinor: fee, discountMinor: discount, additionalMinor: extra };
}