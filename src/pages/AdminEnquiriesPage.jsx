import { useState } from "react";
import Container from "../components/common/Container";
import Breadcrumbs from "../components/common/Breadcrumbs";
import usePageSeo from "../hooks/usePageSeo";
import { useListEnquiriesQuery, useUpdateEnquiryStatusMutation } from "../services/enquiryApi";
import { ROUTES } from "../utils/constant";
import "../styles/course-pages.css";
import "../styles/admin.css";

const PAGE = 20;
const STATUSES = ["new", "contacted", "closed"];

export default function AdminEnquiriesPage() {
  usePageSeo({ title: "Student enquiries | INVYN TECH", description: "Follow up on student enquiries.", path: ROUTES.adminEnquiries }, []);

  const [status, setStatus] = useState("");
  const [page, setPage] = useState(0);
  const [error, setError] = useState(null);

  const { data, isLoading, isError, refetch } = useListEnquiriesQuery({ limit: PAGE, offset: page * PAGE, ...(status ? { status } : {}) });
  const [updateStatus] = useUpdateEnquiryStatusMutation();

  const rows = data?.enquiries ?? [];
  const total = data?.total ?? 0;
  const pages = Math.max(1, Math.ceil(total / PAGE));

  const change = async (id, next) => {
    setError(null);
    try {
      await updateStatus({ id, status: next }).unwrap();
    } catch (e) {
      setError(e?.data?.message ?? "The status could not be updated.");
    }
  };

  return (
    <div className="inv-page">
      <Container>
        <Breadcrumbs items={[{ label: "Home", to: ROUTES.home }, { label: "Dashboard", to: ROUTES.adminDashboard }, { label: "Enquiries" }]} />
        <div className="inv-admin">
          <header>
            <p className="inv-eyebrow">ADMIN</p>
            <h1 className="inv-section-title">Student enquiries</h1>
          </header>

          <div className="inv-admin__bar">
            <label htmlFor="enq-status" className="visually-hidden">Filter by status</label>
            <select id="enq-status" className="inv-cf__control" value={status} onChange={(e) => { setStatus(e.target.value); setPage(0); }} style={{ maxWidth: "12rem" }}>
              <option value="">All statuses</option>
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <span className="inv-admin__muted">{total} total</span>
          </div>

          {error && <div className="inv-admin__panel inv-admin__panel--error" role="alert"><p>{error}</p></div>}
          {isLoading && <p role="status">Loading…</p>}
          {isError && <div className="inv-admin__panel inv-admin__panel--error" role="alert"><p>Enquiries could not be loaded.</p><button type="button" className="inv-btn inv-btn--outline inv-btn--sm" onClick={refetch}>Try again</button></div>}
          {!isLoading && !isError && rows.length === 0 && <p className="inv-admin__empty">No enquiries yet.</p>}

          {rows.length > 0 && (
            <div className="inv-admin__tablewrap">
              <table className="inv-admin__table" style={{ minWidth: 900 }}>
                <caption className="visually-hidden">Student enquiries</caption>
                <thead><tr><th>Received</th><th>Name</th><th>Contact</th><th>Interested in</th><th>Message</th><th>Status</th></tr></thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id}>
                      <td className="inv-admin__muted">{new Date(r.createdAt).toLocaleString()}</td>
                      <td>{r.name}</td>
                      <td><a href={`mailto:${r.email}`}>{r.email}</a><br /><a href={`tel:${r.phone}`}>{r.phone}</a></td>
                      <td>{r.interestedCourse}</td>
                      <td style={{ maxWidth: 260 }}>{r.message || <span className="inv-admin__muted">–</span>}</td>
                      <td>
                        <label className="visually-hidden" htmlFor={`st-${r.id}`}>Status for {r.name}</label>
                        <select id={`st-${r.id}`} className="inv-cf__control" value={r.status} onChange={(e) => change(r.id, e.target.value)}>
                          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {rows.length > 0 && (
            <div className="inv-admin__pager">
              <span className="inv-admin__muted">Page {page + 1} of {pages}</span>
              <button type="button" className="inv-btn inv-btn--outline inv-btn--sm" onClick={() => setPage((p) => p - 1)} disabled={page === 0}>Previous</button>
              <button type="button" className="inv-btn inv-btn--outline inv-btn--sm" onClick={() => setPage((p) => p + 1)} disabled={page + 1 >= pages}>Next</button>
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}