import "./App.css";
import NavbarComponent from "../components/Layout/Navbar/Navbar";
import Footer from "../components/Layout/Footer/Footer";
import Router from "../components/Router";
import { useKeycloak } from "@react-keycloak/web";
import { useEffect } from "react";
import { useAppDispatch } from "../store/hooks";
import { login } from "../features/reducers/user";
import { Container } from "react-bootstrap";

function App() {
  const { keycloak, initialized } = useKeycloak();
  const dispatch = useAppDispatch();

  useEffect(() => {
    // if keycloak is initialized store user in state
    if (initialized) {
      keycloak.loadUserInfo().then((res) => {
        dispatch(login(res));
      });
    }
  });

  return (
    <Container fluid style={{minHeight: '100vh', position: 'relative'}}>
      <main>
      <NavbarComponent />
      <Router />
      </main>
      <Container fluid={true} className="footer-row-container">
      <Footer />
      </Container>
    </Container>
  );
}

export default App;
