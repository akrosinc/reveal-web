import "./App.css";
import NavbarComponent from "../components/Layout/Navbar/Navbar";
import Footer from "../components/Layout/Footer/Footer";
import Router from "../components/Router";
import { useKeycloak } from "@react-keycloak/web";
import { useEffect } from "react";
import { useAppDispatch } from "../store/hooks";
import { login } from "../features/reducers/user";
import { Container } from "react-bootstrap";
import { toast, ToastContainer } from 'react-toastify';
import Loader from '../components/Layout/Loader';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const { keycloak, initialized } = useKeycloak();
  const dispatch = useAppDispatch();

  useEffect(() => {
    // if keycloak is initialized store user in state
    if (initialized) {
      keycloak.onTokenExpired = () => console.log("expired token");
      keycloak.loadUserInfo().then((res) => {
        let userDetails: any = {
          ...res,
          roles: keycloak.realmAccess,
          realmAccess: keycloak.resourceAccess
        }
        dispatch(login(userDetails));
        toast.success("Welcome back " + userDetails.preferred_username)
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
      <ToastContainer position={toast.POSITION.BOTTOM_RIGHT}/>
      <Loader />
    </Container>
  );
}

export default App;
