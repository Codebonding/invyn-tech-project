import { Link, useNavigate } from "react-router-dom";
import Container from "../components/common/Container";
import Breadcrumbs from "../components/common/Breadcrumbs";
import usePageSeo from "../hooks/usePageSeo";
import useAuth from "../hooks/useAuth";
import { useLogoutUserMutation } from "../services/authApi";
import { ROUTES } from "../utils/constant";
import "../styles/course-pages.css";

export default function AccountPage() {
  usePageSeo(
    {
      title: "Your account | INVYN TECH",
      description: "Your INVYN TECH account.",
      path: ROUTES.account,
    },
    [],
  );

  const navigate = useNavigate();
  const { user } = useAuth();
  const [logoutUser, { isLoading }] = useLogoutUserMutation();

  const onLogout = async () => {
    try {
      await logoutUser().unwrap();
    } catch {
      /* the local session is cleared either way (see authApi.logoutUser) */
    }
    navigate(ROUTES.home, { replace: true });
  };

  if (!user) return null;

  return (
    <div className="inv-page">
      <Container>
        <Breadcrumbs
          items={[{ label: "Home", to: ROUTES.home }, { label: "Account" }]}
        />
        <div className="inv-enroll">
          <header>
            <p className="inv-eyebrow">ACCOUNT</p>
            <h1 className="inv-section-title">Hello, {user.name}</h1>
          </header>
          <div className="inv-enroll__done">
            <p>
              <strong>Email:</strong> {user.email}
            </p>
            <p>
              <strong>Role:</strong> {user.role}
            </p>
            <div className="inv-enroll__actions">
              {user.role === "admin" && (
                <>
                  <Link
                    className="inv-btn inv-btn--primary"
                    to={ROUTES.adminDashboard}
                  >
                    Admin dashboard
                  </Link>
                  <Link
                    className="inv-btn inv-btn--outline"
                    to={ROUTES.adminEmployees}
                  >
                    Manage employees
                  </Link>
                </>
              )}
              <Link
                className="inv-btn inv-btn--outline"
                to={ROUTES.changePassword}
              >
                Change password
              </Link>
              <button
                type="button"
                className="inv-btn inv-btn--primary"
                onClick={onLogout}
                disabled={isLoading}
              >
                {isLoading ? "Logging out…" : "Log out"}
              </button>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
