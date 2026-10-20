import { useState } from "react";

/**
 * Two cases:
 *  - emailSent: the link went to the employee's inbox. The server never shows it to the admin.
 *  - otherwise (email not configured or failed): the one-time link is shown here so it can be shared manually.
 */
export default function InvitationPanel({ invitation, onDismiss }) {
  const [copied, setCopied] = useState(false);
  const expires = new Date(invitation.expiresAt).toLocaleString();

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(invitation.setupUrl);
      setCopied(true);
    } catch {
      document.getElementById("invitation-url")?.select();
    }
  };

  if (invitation.emailSent) {
    return (
      <section className="inv-admin__panel" aria-labelledby="invitation-title" role="status">
        <h2 id="invitation-title">Invitation sent</h2>
        <p>
          An invitation email was sent to <strong>{invitation.email}</strong>. The link expires on <strong>{expires}</strong> and works once.
          If it does not arrive, check spam or use <strong>Resend invite</strong>.
        </p>
        <button type="button" className="inv-btn inv-btn--outline inv-btn--sm" onClick={onDismiss}>Dismiss</button>
      </section>
    );
  }

  return (
    <section className="inv-admin__panel inv-admin__panel--warn" aria-labelledby="invitation-title" role="status">
      <h2 id="invitation-title">Invitation for {invitation.employeeName}</h2>
      <p>
        The email could not be sent (it is not configured or the mail server refused it), so share this link yourself over a secure channel.
        It is shown <strong>only once</strong>, expires on <strong>{expires}</strong>, and stops working as soon as it is used or re-issued.
      </p>
      <div className="inv-admin__copy">
        <input id="invitation-url" className="inv-cf__control" readOnly value={invitation.setupUrl} onFocus={(e) => e.target.select()} aria-label="Invitation link" />
        <button type="button" className="inv-btn inv-btn--primary inv-btn--sm" onClick={copy}>{copied ? "Copied" : "Copy link"}</button>
        <button type="button" className="inv-btn inv-btn--outline inv-btn--sm" onClick={onDismiss}>Dismiss</button>
      </div>
    </section>
  );
}