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
  faMinus,
  faInfoCircle,
  faAlignLeft,
  faSun,
  faMoon,
  faSearch,
  faExclamationTriangle,
  faCog,
  faUnlock,
  faLock
} from '@fortawesome/free-solid-svg-icons';
import SimpleBar from 'simplebar-react';
import 'simplebar/dist/simplebar.min.css';
import ErrorHandler from '../components/ErrorHandler';
import api from '../api/axios';
import { usePath } from '../hooks/usePath';
import dashBoardApi from '../api/dashboard-axios';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';

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
  faMinus,
  faInfoCircle,
  faAlignLeft,
  faSun,
  faMoon,
  faSearch,
  faExclamationTriangle,
  faCog,
  faUnlock,
  faLock
);

function App() {
  const { keycloak, initialized } = useKeycloak();
  const dispatch = useAppDispatch();

  // custom hook to listen and change document title on page navigation
  usePath();

  useEffect(() => {
    // if keycloak is initialized show welcome message and
    // create request interceptor to inject bearer token
    if (initialized) {
      dispatch(showLoader(false));
      if (keycloak.authenticated) {
        keycloak.loadUserProfile().then(res => {
          toast.success('Welcome back ' + res.username);
        });
        api.interceptors.request.use(function (config) {
          dispatch(showLoader(true));
          // Inject Bearer token in every request
          config.headers = {
            Authorization: `Bearer ${keycloak.token}`
          };
          return config;
        });
        dashBoardApi.interceptors.request.use(function (config) {
          dispatch(showLoader(true));
          // Inject Bearer token in every request
          config.headers = {
            Authorization: `Bearer ${keycloak.token}`
          };
          return config;
        });
      }
    } else {
      dispatch(showLoader(true));
    }
  }, [initialized, dispatch, keycloak]);

  return (
    <ErrorHandler>
      <>
        <SimpleBar style={{ height: '100vh' }}>
          <Container fluid>
            <main>
              <NavbarComponent />
              <Router />
            </main>
            <Container fluid className="footer-row-container">
              <Footer />
            </Container>
          </Container>
        </SimpleBar>
        <ToastContainer position={toast.POSITION.BOTTOM_RIGHT} />
        <Loader />
      </>
    </ErrorHandler>
  );
}

export default App;
