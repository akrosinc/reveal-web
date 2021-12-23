import { Route, Routes } from "react-router";
import { Navigate } from "react-router-dom";
import {
  HOME_PAGE,
  USER_MANAGEMENT,
  USER_MANAGEMENT_ORGANIZATION_DETAILS,
  PLANS,
} from "../constants/";
import Home from "../features/pages/HomePage/Home";
import Plans from "../features/pages/PlansPage/Plans";
import UserManagement from "../features/pages/UserManagementPage/UserManagement";
import OrganizationDetails from "../features/pages/UserManagementPage/OrganizationPage/details/OrganizationDetails";
import { Spinner } from "react-bootstrap";
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
              <AuthGuard roles={["manage-users"]}>
                <UserManagement />
              </AuthGuard>
            }
          >
            <Route path=":tab" element={<UserManagement />} />
          </Route>
          <Route
            path={USER_MANAGEMENT_ORGANIZATION_DETAILS}
            element={<OrganizationDetails />}
          />
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
    return (
      <Spinner
        animation="grow"
        variant="success"
        style={{
          width: "3rem",
          height: "3rem",
          position: "absolute",
          left: "50%",
          top: "40%",
          marginLeft: "-1.5rem",
        }}
      />
    );
  }
}
