import { useEffect, useRef, useState } from "react";
import FormField from "../student/profile/FormField";
import { serverFieldErrors, serverMessage } from "../../utils/profileValidation";
import { METHODS, formatMinor, newIdempotencyKey, parseRupees, validateManualPayment, validateRefund } from "../../utils/feeFormat";

function Shell({ titleId, title, subtitle, onCancel, onSubmit, busy, error, submitLabel, children }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape" && !busy) onCancel(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [busy, onCancel]);
  return (
    <div className="sp-overlay">
      <form className="sp-dialog fe-dialog" role="dialog" aria-modal="true" aria-labelledby={titleId} onSubmit={onSubmit} noValidate>
        <h2 id={titleId}>{title}</h2>
        {subtitle && <p className="sd-muted">{subtitle}</p>}
        {children}
        {error && <p className="sp-error" role="alert">{error}</p>}
        <div className="sp-actions">
          <button type="submit" className="sd-btn sd-btn--primary" disabled={busy}>{busy ? "Saving…" : submitLabel}</button>
          <button type="button" className="sd-btn" disabled={busy} onClick={onCancel}>Cancel</button>
        </div>
      </form>
    </div>
  );
}

/** Runs validate -> submit -> maps server errors. The idempotency key is made ONCE per dialog, so a retry is never a second payment. */
function useSubmit(onSubmit) {
  const keyRef = useRef(newIdempotencyKey());
  const busyRef = useRef(false);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const run = async (validation, payload) => {
    if (busyRef.current) return;
    setErrors(validation); setError("");
    if (Object.keys(validation).length) return;
    busyRef.current = true; setBusy(true);
    try { await onSubmit({ ...payload, idempotencyKey: keyRef.current }); }
    catch (e) { setErrors(serverFieldErrors(e)); setError(serverMessage(e)); }
    finally { busyRef.current = false; setBusy(false); }
  };
  return { busy, errors, error, run, setErrors };
}

export function ManualPaymentDialog({ fee, onSubmit, onCancel }) {
  const [v, setV] = useState({ amount: "", method: "cash", externalReference: "", paymentDate: new Date().toISOString().slice(0, 10), remarks: "" });
  const s = useSubmit(onSubmit);
  const set = (k, val) => { setV((x) => ({ ...x, [k]: val })); s.setErrors((e) => ({ ...e, [k]: undefined })); };
  const submit = (e) => {
    e.preventDefault();
    const { errors, amountMinor } = validateManualPayment(v, fee.outstandingMinor);
    s.run(errors, { studentFeeId: fee.id, amountMinor, method: v.method, externalReference: v.externalReference.trim() || undefined, paymentDate: new Date(`${v.paymentDate}T12:00:00Z`).toISOString(), remarks: v.remarks.trim() || undefined });
  };
  return (
    <Shell titleId="fe-manual" title="Record an offline payment" subtitle={`${fee.student?.name} · ${fee.courseTitle} · Outstanding ${formatMinor(fee.outstandingMinor, fee.currency)}`} onCancel={onCancel} onSubmit={submit} busy={s.busy} error={s.error} submitLabel="Record payment">
      <FormField id="mp-amount" label="Amount (₹)" required inputMode="decimal" value={v.amount} error={s.errors.amount || s.errors.amountMinor} onChange={(e) => set("amount", e.target.value)} />
      <FormField id="mp-method" label="Payment method" as="select" required options={METHODS} value={v.method} error={s.errors.method} onChange={(e) => set("method", e.target.value)} />
      <FormField id="mp-ref" label="Reference number" required={v.method !== "cash"} maxLength={60} value={v.externalReference} error={s.errors.externalReference} hint="Bank transaction id, UPI reference or cheque number." onChange={(e) => set("externalReference", e.target.value)} />
      <FormField id="mp-date" label="Payment date" type="date" required max={new Date().toISOString().slice(0, 10)} value={v.paymentDate} error={s.errors.paymentDate} onChange={(e) => set("paymentDate", e.target.value)} />
      <FormField id="mp-remarks" label="Remarks" maxLength={255} value={v.remarks} error={s.errors.remarks} onChange={(e) => set("remarks", e.target.value)} />
    </Shell>
  );
}

export function RefundDialog({ payment, onSubmit, onCancel }) {
  const refundable = payment.amountMinor - payment.refundedMinor;
  const [v, setV] = useState({ amount: "", reason: "" });
  const s = useSubmit(onSubmit);
  const set = (k, val) => { setV((x) => ({ ...x, [k]: val })); s.setErrors((e) => ({ ...e, [k]: undefined })); };
  const submit = (e) => {
    e.preventDefault();
    const { errors, amountMinor } = validateRefund(v, refundable);
    s.run(errors, { id: payment.id, amountMinor, reason: v.reason.trim() });
  };
  return (
    <Shell titleId="fe-refund" title="Refund this payment" subtitle={`${payment.transactionId} · up to ${formatMinor(refundable, payment.currency)} can be refunded`} onCancel={onCancel} onSubmit={submit} busy={s.busy} error={s.error} submitLabel="Record refund">
      <FormField id="rf-amount" label="Refund amount (₹)" required inputMode="decimal" value={v.amount} error={s.errors.amount || s.errors.amountMinor} onChange={(e) => set("amount", e.target.value)} />
      <FormField id="rf-reason" label="Reason" as="textarea" required maxLength={255} value={v.reason} error={s.errors.reason} onChange={(e) => set("reason", e.target.value)} />
      <p className="sd-muted">A refund is recorded as a separate transaction. The original payment and receipt are kept.</p>
    </Shell>
  );
}

export function AdjustFeeDialog({ fee, onSubmit, onCancel }) {
  const inr = (m) => (m / 100).toFixed(2).replace(/\.00$/, "");
  const [v, setV] = useState({ discount: inr(fee.discountMinor), additional: inr(fee.additionalMinor), dueDate: fee.dueDate || "", reason: "" });
  const s = useSubmit(onSubmit);
  const set = (k, val) => { setV((x) => ({ ...x, [k]: val })); s.setErrors((e) => ({ ...e, [k]: undefined })); };
  const submit = (e) => {
    e.preventDefault();
    const errors = {};
    const discountMinor = parseRupees(v.discount || "0"); const additionalMinor = parseRupees(v.additional || "0");
    if (discountMinor === null) errors.discount = "Enter a valid discount.";
    else if (discountMinor > fee.courseFeeMinor) errors.discount = "The discount cannot be more than the course fee.";
    if (additionalMinor === null) errors.additional = "Enter valid additional charges.";
    if (v.reason.trim().length < 5) errors.reason = "Give a reason (at least 5 characters).";
    s.run(errors, { id: fee.id, discountMinor, additionalMinor, dueDate: v.dueDate || null, reason: v.reason.trim() });
  };
  return (
    <Shell titleId="fe-adjust" title="Adjust this student's fee" subtitle={`Course fee ${formatMinor(fee.courseFeeMinor, fee.currency)} is fixed for this enrolment.`} onCancel={onCancel} onSubmit={submit} busy={s.busy} error={s.error} submitLabel="Save adjustment">
      <FormField id="af-discount" label="Discount (₹)" inputMode="decimal" value={v.discount} error={s.errors.discount || s.errors.discountMinor} onChange={(e) => set("discount", e.target.value)} />
      <FormField id="af-additional" label="Additional charges (₹)" inputMode="decimal" value={v.additional} error={s.errors.additional || s.errors.additionalMinor} onChange={(e) => set("additional", e.target.value)} />
      <FormField id="af-due" label="Due date" type="date" value={v.dueDate} error={s.errors.dueDate} onChange={(e) => set("dueDate", e.target.value)} />
      <FormField id="af-reason" label="Reason" as="textarea" required maxLength={255} value={v.reason} error={s.errors.reason} onChange={(e) => set("reason", e.target.value)} />
    </Shell>
  );
}