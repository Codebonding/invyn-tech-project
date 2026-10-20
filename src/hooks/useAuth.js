import { useSelector } from "react-redux";
import { authApi } from "../services/authApi";

const selectSession = authApi.endpoints.getCurrentUser.select();

/**
 * Read-only view of the session. It only SELECTS from the RTK Query cache and never fetches, so using it
 * in many components cannot cause duplicate /auth/me requests. <SessionBootstrap /> performs the one request.
 */
export default function useAuth() {
  const session = useSelector(selectSession);
  return {
    user: session.data ?? null,
    isAuthenticated: Boolean(session.data),
    isLoading: session.status === "uninitialized" || (session.status === "pending" && !session.data),
  };
}
