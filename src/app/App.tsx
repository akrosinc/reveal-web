import './App.css';
import NavbarComponent from '../components/Layout/Navbar';
import Footer from '../components/Layout/Footer/Footer';
import Router from '../components/Router';
import { useKeycloak } from '@react-keycloak/web';
import { useEffect } from 'react';
import { useAppDispatch } from '../store/hooks';
import { Container } from 'react-bootstrap';
import { toast, ToastContainer } from 'react-toastify';
import Loader from '../components/Layout/Loader';
import 'react-toastify/dist/ReactToastify.css';
import { showLoader } from '../features/reducers/loader';
import { library } from '@fortawesome/fontawesome-svg-core';
import {
  faSort,
  faSortUp,
  faSortDown,
  faChevronRight,
  faChevronDown,
  faChevronUp,
  faTrash,
  faEdit,
  faSave,
  faArrowLeft,
  faPlus,
  faInfoCircle,
  faAlignLeft,
  faSun,
  faMoon,
} from '@fortawesome/free-solid-svg-icons';
import SimpleBar from 'simplebar-react';
import 'simplebar/dist/simplebar.min.css';

//Here we add all Font Awesome icons needed in the app so we dont have to import them in each component
library.add(
  faSort,
  faSortUp,
  faSortDown,
  faChevronRight,
  faChevronDown,
  faChevronUp,
  faTrash,
  faEdit,
  faSave,
  faArrowLeft,
  faPlus,
  faInfoCircle,
  faAlignLeft,
  faSun,
  faMoon
);

function App() {
  const { keycloak, initialized } = useKeycloak();
  const dispatch = useAppDispatch();

  useEffect(() => {
    // if keycloak is initialized store user in state
    if (initialized) {
      dispatch(showLoader(false));
      if (keycloak.authenticated) {
        keycloak.loadUserProfile().then(res => {
          toast.success('Welcome back '+ res.username);
        });
      }
    } else {
      dispatch(showLoader(true));
    }
  });

  return (
    <SimpleBar style={{ maxHeight: '100vh' }}>
    <Container fluid style={{ minHeight: '100vh', position: 'relative' }}>
      <main>
        <NavbarComponent />
        <Router />
      </main>
      <Container fluid={true} className="footer-row-container">
        <Footer />
      </Container>
      <ToastContainer position={toast.POSITION.BOTTOM_RIGHT} />
      <Loader />
    </Container>
    </SimpleBar>
  );
}

export default App;
