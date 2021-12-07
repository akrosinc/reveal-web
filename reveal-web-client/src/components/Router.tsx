import { Route, Routes } from "react-router";
import Home from "../features/home/Home";
import Register from "../features/register/Register";
import { HOME_PAGE, REGISTER_PAGE } from "../constants/";
import { useKeycloak } from "@react-keycloak/web";

export default function Router() {
  const { initialized } = useKeycloak();
  if (initialized) {
    return (
    <div style={{}}>
      <Routes>
        <Route path={HOME_PAGE} element={<Home />} />
        <Route path={REGISTER_PAGE} element={<Register />} />
      </Routes>
    </div>
    );
  } else {
    return <h1 className="text-center">Redirecting to keycloak...</h1>;
  }
}
