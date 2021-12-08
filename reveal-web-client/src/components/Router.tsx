import { Route, Routes } from "react-router";
import Home from "../features/pages/HomePage/Home";
import CreateUser from '../features/pages/UserManagementPage/users/create/CreateUser';
import { HOME_PAGE, USER_MANAGEMENT, USER_MANAGEMENT_SINGLE_USER_CREATE } from "../constants/";
import { useKeycloak } from "@react-keycloak/web";
import UserManagement from "../features/pages/UserManagementPage/UserManagement";

export default function Router() {
  const { initialized } = useKeycloak();
  if (initialized) {
    return (
      <Routes>
        <Route path={HOME_PAGE} element={<Home />} />
        <Route path={USER_MANAGEMENT} element={<UserManagement />} />
        <Route path={USER_MANAGEMENT_SINGLE_USER_CREATE} element={<CreateUser />} />
        <Route path="/*" element={<Home />} />
      </Routes>
    );
  } else {
    return <h2 className="text-center mt-5">Loading...</h2>;
  }
}
