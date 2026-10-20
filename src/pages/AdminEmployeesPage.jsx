import { useState } from "react";
import Container from "../components/common/Container";
import Breadcrumbs from "../components/common/Breadcrumbs";
import EmployeeForm from "../components/admin/EmployeeForm";
import EmployeeTable from "../components/admin/EmployeeTable";
import InvitationPanel from "../components/admin/InvitationPanel";
import usePageSeo from "../hooks/usePageSeo";
import {
  useCreateEmployeeMutation,
  useDeleteEmployeeMutation,
  useListEmployeesQuery,
  useResendInvitationMutation,
  useSetEmployeeStatusMutation,
  useUpdateEmployeeMutation,
  useSetEmployeePermissionsMutation
} from "../services/employeesApi";
import { toFormErrors } from "../utils/authValidation";
import { ROUTES } from "../utils/constant";
import "../styles/course-pages.css";
import "../styles/admin.css";

const PAGE_SIZE = 10;
const STATUS_FILTERS = [
  { value: "", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "invited", label: "Invited" },
  { value: "inactive", label: "Inactive" },
  { value: "suspended", label: "Suspended" },
];

export default function AdminEmployeesPage() {
  usePageSeo({ title: "Manage employees | INVYN TECH", description: "Create and manage employee accounts.", path: ROUTES.adminEmployees }, []);

  const [status, setStatus] = useState("");
  const [page, setPage] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [invitation, setInvitation] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const { data, isLoading, isFetching, isError, error, refetch } = useListEmployeesQuery({
    limit: PAGE_SIZE,
    offset: page * PAGE_SIZE,
    ...(status ? { status } : {}),
  });
  const [createEmployee, { isLoading: creating }] = useCreateEmployeeMutation();
  const [updateEmployee] = useUpdateEmployeeMutation();
  const [setEmployeeStatus] = useSetEmployeeStatusMutation();
  const [resendInvitation] = useResendInvitationMutation();
  const [deleteEmployee] = useDeleteEmployeeMutation();
  const [setEmployeePermissions] = useSetEmployeePermissionsMutation();
  const employees = data?.employees ?? [];
  const total = data?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const showInvitation = ({ employee, invitation: inv, email }) =>
    setInvitation({ employeeName: employee.name, email: employee.email, emailSent: Boolean(email?.sent), ...inv });


  // Runs one row action, surfacing any server error in the banner instead of throwing.
  const run = async (id, action) => {
    setActionError(null);
    setBusyId(id);
    try {
      await action();
      return true;
    } catch (err) {
      setActionError(toFormErrors(err).formError ?? "That action could not be completed.");
      return false;
    } finally {
      setBusyId(null);
    }
  };

  const onCreate = async (values) => {
    const result = await createEmployee(values).unwrap(); // rejects into EmployeeForm, which shows field errors
    showInvitation(result);
    setShowForm(false);
    setPage(0);
  };

  const onRename = (id, name) => run(id, () => updateEmployee({ id, name }).unwrap());

  const onToggle = (employee) => {
    const next = employee.status === "active" ? "inactive" : "active";
    if (next === "inactive" && !window.confirm(`Deactivate ${employee.name}? They will be signed out immediately and cannot log in.`)) return;
    run(employee.id, () => setEmployeeStatus({ id: employee.id, status: next }).unwrap());
  };

  const onResend = (employee) => {
    if (!window.confirm(`Issue a new invitation for ${employee.name}? Any previous link will stop working.`)) return;
    run(employee.id, async () => {
      const result = await resendInvitation(employee.id).unwrap();
      showInvitation(result);
    });
  };

  const onDelete = async (employee) => {
    const message = `Permanently delete ${employee.name} (${employee.email})? This cannot be undone. Courses they created are kept but will have no owner.`;
    if (!window.confirm(message)) return;
    const ok = await run(employee.id, () => deleteEmployee(employee.id).unwrap());
    if (ok && employees.length === 1 && page > 0) setPage((p) => p - 1); // do not stay on a now-empty page
  };
  const onToggleCourses = (employee) => {
    const next = !employee.canManageCourses;
    const message = next
      ? `Allow ${employee.name} to create and manage their own courses?`
      : `Remove ${employee.name}'s permission to manage courses? Their existing courses are kept.`;
    if (!window.confirm(message)) return;
    run(employee.id, () => setEmployeePermissions({ id: employee.id, canManageCourses: next }).unwrap());
  };
  const onFilter = (e) => { setStatus(e.target.value); setPage(0); };

  return (
    <div className="inv-page">
      <Container>
        <Breadcrumbs items={[{ label: "Home", to: ROUTES.home }, { label: "Account", to: ROUTES.account }, { label: "Employees" }]} />
        <div className="inv-admin">
          <header>
            <p className="inv-eyebrow">ADMIN</p>
            <h1 className="inv-section-title">Employees</h1>
          </header>

          <div className="inv-admin__bar">
            <div className="inv-admin__filters">
              <label htmlFor="status-filter" className="visually-hidden">Filter by status</label>
              <select id="status-filter" className="inv-cf__control" value={status} onChange={onFilter}>
                {STATUS_FILTERS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
              </select>
              {isFetching && !isLoading && <span className="inv-admin__muted" role="status">Updating…</span>}
            </div>
            {!showForm && <button type="button" className="inv-btn inv-btn--primary" onClick={() => setShowForm(true)}>Add employee</button>}
          </div>

          {invitation && <InvitationPanel invitation={invitation} onDismiss={() => setInvitation(null)} />}
          {showForm && <EmployeeForm onSubmit={onCreate} onCancel={() => setShowForm(false)} isLoading={creating} />}
          {actionError && <div className="inv-admin__panel inv-admin__panel--error" role="alert"><p>{actionError}</p></div>}

          {isLoading && <p role="status">Loading employees…</p>}

          {isError && (
            <div className="inv-admin__panel inv-admin__panel--error" role="alert">
              <p>{error?.data?.message ?? "Employees could not be loaded."}</p>
              <button type="button" className="inv-btn inv-btn--outline inv-btn--sm" onClick={refetch}>Try again</button>
            </div>
          )}

          {!isLoading && !isError && employees.length === 0 && (
            <p className="inv-admin__empty">{status ? "No employees match this filter." : "No employees yet. Add the first one."}</p>
          )}

          {employees.length > 0 && (
            <>
              <EmployeeTable employees={employees} busyId={busyId} onRename={onRename} onToggle={onToggle} onResend={onResend} onDelete={onDelete} onToggleCourses={onToggleCourses} />
              <div className="inv-admin__pager">
                <span className="inv-admin__muted">Page {page + 1} of {pageCount} · {total} total</span>
                <button type="button" className="inv-btn inv-btn--outline inv-btn--sm" onClick={() => setPage((p) => p - 1)} disabled={page === 0}>Previous</button>
                <button type="button" className="inv-btn inv-btn--outline inv-btn--sm" onClick={() => setPage((p) => p + 1)} disabled={page + 1 >= pageCount}>Next</button>
              </div>
            </>
          )}
        </div>
      </Container>
    </div>
  );
}