import { Navigate, useLocation } from "react-router-dom";
import Container from "../common/Container";
import useAuth from "../../hooks/useAuth";
import { ROUTES } from "../../utils/constant";

/**
 * UI convenience only: the backend enforces authentication and roles on every API request.
 * `roles` (optional) hides pages from users who could not use them anyway.
 */
export default function ProtectedRoute({ children, roles }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="inv-page">
        <Container>
          <p role="status">Checking your session…</p>
        </Container>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to={ROUTES.login} replace state={{ from: location }} />;
  if (roles && !roles.includes(user.role)) return <Navigate to={ROUTES.home} replace />;

  return children;
}
