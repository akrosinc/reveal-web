import { Route, Routes } from "react-router";
import { Navigate } from "react-router-dom";
import {
  HOME_PAGE,
  USER_MANAGEMENT,
  PLANS,
  ROLE_MANAGE_USER
} from "../constants/";
import Home from "../features/pages/HomePage/Home";
import Plans from "../features/pages/PlansPage";
import Management from "../features/pages/Management";
import { useKeycloak } from "@react-keycloak/web";
import AuthGuard from "./AuthGuard";
import PublicPage from "./pages/PublicPage";
import ErrorPage from "./pages/ErrorPage";

export default function Router() {
  const { keycloak, initialized } = useKeycloak();

  if (initialized) {
    if (keycloak.authenticated) {
      return (
        <Routes>
          <Route path="*" element={<ErrorPage />} />
          <Route path={HOME_PAGE} element={<Home />} />
          <Route path={PLANS} element={<Plans />} />
          <Route
            path={USER_MANAGEMENT}
            element={
              <AuthGuard roles={[ROLE_MANAGE_USER]}>
                <Management />
              </AuthGuard>
            }
          >
            <Route
              path=":tab"
              element={
                <AuthGuard roles={[ROLE_MANAGE_USER]}>
                  <Management />
                </AuthGuard>
              }
            />
          </Route>
        </Routes>
      );
    } else {
      return (
        <Routes>
          <Route path="*" element={<Navigate replace to="/" />} />
          <Route path="/" element={<PublicPage />} />
        </Routes>
      );
    }
  } else {
    return null;
  }
}
