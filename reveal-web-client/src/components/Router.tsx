import { Route, Routes } from "react-router";
import Home from "../features/pages/HomePage/Home";
import CreateUser from "../features/pages/UserManagementPage/UsersPage/create/CreateUser";
import {
  HOME_PAGE,
  USER_MANAGEMENT,
  USER_MANAGEMENT_USER_CREATE,
  USER_MANAGEMENT_USER_EDIT,
  USER_MANAGEMENT_ORGANIZATION_DETAILS,
  USER_MANAGEMENT_ORGANIZATION_CREATE
} from "../constants/";
import { useKeycloak } from "@react-keycloak/web";
import UserManagement from "../features/pages/UserManagementPage/UserManagement";
import OrganizationDetails from "../features/pages/UserManagementPage/OrganizationPage/details/OrganizationDetails";
import CreateOrganization from "../features/pages/UserManagementPage/OrganizationPage/create/CreateOrganization";
import EditUser from "../features/pages/UserManagementPage/UsersPage/edit/Edit";
import { Spinner, Container } from "react-bootstrap";

export default function Router() {
  const { initialized } = useKeycloak();

  if (initialized) {
    return (
      <Routes>
        <Route
          path="*"
          element={
            <Container className="text-center mt-5">
              <h2>Not found 404</h2>
              <p>There's nothing here!</p>
            </Container>
          }
        />
        <Route path={HOME_PAGE} element={<Home />} />
        <Route path={USER_MANAGEMENT} element={<UserManagement />}>
          <Route path=":tab" element={<UserManagement />} />
        </Route>
        <Route
          path={USER_MANAGEMENT_ORGANIZATION_CREATE}
          element={<CreateOrganization />}
        />
        <Route
          path={USER_MANAGEMENT_ORGANIZATION_DETAILS}
          element={<OrganizationDetails />}
        />
        <Route path={USER_MANAGEMENT_USER_CREATE} element={<CreateUser />} />
        <Route
          path={USER_MANAGEMENT_USER_EDIT}
          element={<EditUser />}
        />
      </Routes>
    );
  } else {
    return (
        
              <Spinner
              animation="grow"
              variant="success"
              style={{width:'3rem', height:'3rem', position: 'absolute', left: '50%', top: '40%', marginLeft: '-1.5rem'}}
            />
        
    );
  }
}
