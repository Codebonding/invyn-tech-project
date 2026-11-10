import { useState } from "react";
import { Link } from "react-router-dom";
import Container from "../components/common/Container";
import usePageSeo from "../hooks/usePageSeo";
import { useCreateFeeStructureMutation, useGetFeeStructuresQuery, useUpdateFeeStructureMutation } from "../services/feesApi";
import { formatMinor } from "../utils/feeFormat";
import { ROUTES } from "../utils/constant";
import { serverMessage } from "../utils/profileValidation";
import { formatDate } from "../utils/studentFormat";
import FeeStatusBadge from "../components/fees/FeeStatusBadge";
import FeeStructureForm from "../components/fees/FeeStructureForm";
import Pagination from "../components/student/courses/Pagination";
import { CardSkeleton, EmptyState, ErrorState } from "../components/student/StudentStates";
import { Toasts, useToasts } from "../components/student/Toasts";
import "../styles/student-dashboard.css";
import "../styles/student-profile.css";
import "../styles/my-courses.css";
import "../styles/learning-materials.css";
import "../styles/fees.css";

const PAGE_SIZE = 10;

export default function FeeStructuresPage() {
  usePageSeo({ title: "Fee structures | INVYN TECH", description: "Configure course fees.", path: ROUTES.staffFeeStructures }, []);
  const [page, setPage] = useState(1);
  const [form, setForm] = useState(null); // null | "new" | structure
  const { toasts, push } = useToasts();
  const list = useGetFeeStructuresQuery({ limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE });
  const [create] = useCreateFeeStructureMutation();
  const [update] = useUpdateFeeStructureMutation();
  const data = list.data;

  const submit = async (body) => {
    if (form === "new") await create(body).unwrap(); else await update({ id: form.id, ...body }).unwrap();
    push("Fee structure saved.");
    setForm(null);
  };
  const toggle = async (s) => {
    try { await update({ id: s.id, isActive: !s.isActive }).unwrap(); push(s.isActive ? "Fee structure deactivated." : "Fee structure activated."); }
    catch (e) { push(serverMessage(e), "error"); }
  };

  return (
    <div className="inv-page"><Container><div className="sp mc fe">
      <nav className="sp-back" aria-label="Breadcrumb"><Link to={ROUTES.staffFees}>← Back to fee management</Link></nav>
      <header className="mc-header"><div><h1>Fee Structures</h1><p className="sd-muted">Set what each course costs. Existing students keep their agreed fee.</p></div>
        <button type="button" className="sd-btn sd-btn--primary" disabled={form !== null} onClick={() => setForm("new")}>New fee structure</button></header>

      {form !== null && <FeeStructureForm key={form === "new" ? "new" : form.id} courses={data?.courses || []} structure={form === "new" ? null : form} onSubmit={submit} onCancel={() => setForm(null)} />}

      {list.isLoading ? <div role="status" aria-label="Loading fee structures"><CardSkeleton lines={3} /></div>
        : list.isError ? <ErrorState message={serverMessage(list.error, "We could not load the fee structures.")} onRetry={list.refetch} />
        : data.total === 0 ? <EmptyState title="No fee structures yet">Courses with a price already set in the course details are billed from that price.</EmptyState>
        : (<>
          <div className="lm-table-wrap"><table className="lm-table">
            <caption className="visually-hidden">Fee structures</caption>
            <thead><tr><th scope="col">Course</th><th scope="col">Fee</th><th scope="col">Discount</th><th scope="col">Additional</th><th scope="col">Total payable</th><th scope="col">Due date</th><th scope="col">Status</th><th scope="col">Actions</th></tr></thead>
            <tbody>{data.items.map((s) => (
              <tr key={s.id}>
                <td data-label="Course"><strong>{s.courseTitle}</strong></td><td data-label="Fee">{formatMinor(s.courseFeeMinor, s.currency)}</td>
                <td data-label="Discount">{formatMinor(s.discountMinor, s.currency)}</td><td data-label="Additional">{formatMinor(s.additionalMinor, s.currency)}</td>
                <td data-label="Total payable">{formatMinor(s.totalPayableMinor, s.currency)}</td><td data-label="Due date">{s.dueDate ? formatDate(s.dueDate) : "—"}</td>
                <td data-label="Status">
  <span
    className={`sd-badge fe-badge ${
      s.isActive ? "fe-badge--ok" : "fe-badge--warn"
    }`}
  >
    {s.isActive ? "Active" : "Inactive"}
  </span>
</td>
                <td data-label="Actions"><div className="lm-actions">
                  <button type="button" className="sd-btn sd-btn--sm" onClick={() => setForm(s)} aria-label={`Edit fee structure for ${s.courseTitle}`}>Edit</button>
                  <button type="button" className="sd-btn sd-btn--sm" onClick={() => toggle(s)} aria-label={`${s.isActive ? "Deactivate" : "Activate"} ${s.courseTitle}`}>{s.isActive ? "Deactivate" : "Activate"}</button>
                </div></td>
              </tr>))}</tbody>
          </table></div>
          <Pagination page={page} pageCount={Math.max(1, Math.ceil(data.total / PAGE_SIZE))} onPage={setPage} />
        </>)}
    </div></Container><Toasts toasts={toasts} /></div>
  );
}