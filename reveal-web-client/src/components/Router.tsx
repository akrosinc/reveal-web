import { Route, Routes } from "react-router";
import Home from "../features/home/Home";
import Register from "../features/register/Register";
import { HOME_PAGE, REGISTER_PAGE } from "../constants/";
import AuthGuard from "./AuthGuard";
import Login from "../features/login/Login";

export default function Router() {
  return (
    <Routes>
      <Route path="/login" element={<Login/>} />
      <Route
        path={HOME_PAGE}
        element={
          <AuthGuard>
            <Home />
          </AuthGuard>
        }
      />
      <Route
        path={REGISTER_PAGE}
        element={
          <AuthGuard>
            <Register />
          </AuthGuard>
        }
      />
    </Routes>
  );
}
