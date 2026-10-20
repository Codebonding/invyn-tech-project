import { useGetCurrentUserQuery } from "../../services/authApi";

/** Restores the session on page load (via the HttpOnly cookie). Renders nothing. A 401 simply means "signed out". */
export default function SessionBootstrap() {
  useGetCurrentUserQuery();
  return null;
}
