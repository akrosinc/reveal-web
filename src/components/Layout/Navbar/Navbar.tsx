import { Button, Container, Nav, Navbar, NavDropdown, OverlayTrigger, Tooltip } from 'react-bootstrap';
import logo from '../../../assets/logos/reveal-logo.png';
import logoWhite from '../../../assets/logos/reveal-logo-white.png';
import { BsPerson, BsArrowLeftRight } from 'react-icons/bs';
import { Link } from 'react-router-dom';
import { useKeycloak } from '@react-keycloak/web';
import { MAIN_MENU } from './menuItems';
import AuthorizedElement from '../../AuthorizedElement';
import i18n, { LOCALES } from '../../../i18n';
import { useTranslation } from 'react-i18next';
import './index.css';
import 'flag-icons/css/flag-icons.css';
import { KeycloakProfile } from 'keycloak-js';
import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { setToBrowser } from '../../../utils';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { setDarkMode } from '../../../features/reducers/darkMode';
import { setCurrentInstance, clearCurrentInstance } from '../../../features/reducers/instanceContext';
import { getInstanceContext } from '../../../features/instance/api';
import SwitchInstanceModal from './SwitchInstanceModal';

const NavbarComponent = () => {
  const { t } = useTranslation();
  const { keycloak, initialized } = useKeycloak();
  const [user, setUser] = useState<KeycloakProfile>();
  const isDarkMode = useAppSelector(state => state.darkMode.value);
  const selectedInstance = useAppSelector(state => state.instanceContext.selectedInstance);
  const dispatch = useAppDispatch();
  const [expanded, setExpanded] = useState(false);
  const [showSwitchModal, setShowSwitchModal] = useState(false);
  const isStandardUser = ((keycloak?.tokenParsed as any)?.groups || [])?.includes('/standard_user');

  useEffect(() => {
    if (initialized && keycloak.authenticated) {
      keycloak.loadUserProfile().then(userProfile => {
        setUser(userProfile);
      });
      // Fetch and persist the user's default instance after login
      getInstanceContext()
        .then(res => dispatch(setCurrentInstance(res)))
        .catch(err => {
          if (err?.response?.status === 404) {
            dispatch(clearCurrentInstance());
          }
        });
      keycloak.onAuthLogout = () => {
        setUser(undefined);
        dispatch(clearCurrentInstance());
      };
    }
  }, [keycloak, initialized, dispatch]);

  useEffect(() => {
    document.body.classList.toggle('dark-mode', isDarkMode);
  }, [isDarkMode]);

  const changeLaguagePrefferences = (lang: any) => {
    i18n.changeLanguage(lang.name);
    setToBrowser('locale', lang.name);
  };

  const loadFlag = () => {
    let currentLanguage = LOCALES.filter(el => el.name === i18n.language);
    return <span className={currentLanguage[0].flag}></span>;
  };

  return (
    <Navbar expanded={expanded} collapseOnSelect expand="md" variant={isDarkMode ? 'dark' : 'light'}>
      <Container fluid className="px-4 pt-1">
        <Navbar.Brand>
          <img
            src={isDarkMode ? logoWhite : logo}
            alt="Reveal Logo"
            className="d-inline-block align-top mb-2"
            width="140px"
          />
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" onClick={() => setExpanded(!expanded)} />
        <Navbar.Collapse id="responsive-navbar-nav" className={keycloak.authenticated ? '' : 'justify-content-end'}>
          {keycloak.authenticated ? (
            <Nav className="me-auto ms-md-2">
              {MAIN_MENU.map((el, index) => {
                if (el.dropdown !== undefined && el.dropdown.length > 0) {
                  // Collect visible children first; hide parent dropdown if no children visible
                  const visibleChildren = el.dropdown;
                  // For superadmin: rename "Plan Management" dropdown to "Instances"
                  const dropdownTitle =
                    !isStandardUser && el.pageTitle === 'Plan Management'
                      ? 'Instances'
                      : t('topNav.' + el.pageTitle);
                  return (
                    <AuthorizedElement key={index} roles={el.roles} path={el.route}>
                      <NavDropdown
                        align="start"
                        title={dropdownTitle}
                        id={el.pageTitle + '-navbar-button'}
                        className="my-1 mx-1 mx-md-2"
                      >
                        {visibleChildren.map((child, childIndex) => {
                          const childTitle =
                            !isStandardUser && child.pageTitle === 'Simulation'
                              ? 'Data viewer'
                              : t('topNav.' + child.pageTitle);
                          return (
                            <AuthorizedElement key={index + '.' + childIndex} roles={child.roles} path={child.route}>
                              <NavDropdown.Item
                                as={Link}
                                role="button"
                                to={child.route}
                                className="text-center"
                                onClick={() => setExpanded(false)}
                              >
                                {childTitle}
                              </NavDropdown.Item>
                            </AuthorizedElement>
                          );
                        })}
                      </NavDropdown>
                    </AuthorizedElement>
                  );
                } else {
                  return (
                    <AuthorizedElement key={index} roles={el.roles} path={el.route}>
                      <Link
                        onClick={() => setExpanded(false)}
                        id={el.pageTitle + '-navbar-button'}
                        to={el.route}
                        className="nav-link my-1 mx-1 mx-md-2"
                      >
                        {t('topNav.' + el.pageTitle)}
                      </Link>
                    </AuthorizedElement>
                  );
                }
              })}
            </Nav>
          ) : null}
          {initialized && user ? (
            <Nav className="d-inline-flex align-items-center">
              {/* Switch Instance button */}
             {((keycloak?.tokenParsed as any)?.groups || [])?.includes('/standard_user') && <Button
                id="switch-instance-button-nav"
                variant="link"
                className="switch-instance-nav-btn me-2"
                onClick={() => setShowSwitchModal(true)}
                title={selectedInstance ? `Current: ${selectedInstance.name}` : 'No Instance Selected'}
              >
                <BsArrowLeftRight className="me-1" />
                {selectedInstance?.name || t('topNav.switchInstance') || 'No Instance Selected'}
              </Button>}
              <BsPerson size="1.2rem" className="mt-1 me-1" />
              <NavDropdown title={user.username} id="logout-nav-dropdown" align="end" className="me-md-4">
                <NavDropdown.Item
                  id="logout-button"
                  className="text-center"
                  onClick={() => {
                    dispatch(clearCurrentInstance());
                    keycloak.logout();
                  }}
                >
                  {t('topNav.logOut')}
                </NavDropdown.Item>
              </NavDropdown>
            </Nav>
          ) : (
            <Nav>
              <Nav.Link
                id="login-button"
                style={{ minWidth: '150px' }}
                className="btn btn-success text-white my-3 my-md-0 me-md-3"
                onClick={() => keycloak.login()}
              >
                {t('topNav.logIn')}
              </Nav.Link>
            </Nav>
          )}
          <Nav className="ms-0 my-2 my-md-0">
            <OverlayTrigger
              placement="auto"
              overlay={<Tooltip>{isDarkMode ? t('darkMode.off') : t('darkMode.on')}</Tooltip>}
            >
              <Button
                className="rounded-circle me-auto mx-md-3"
                onClick={() => {
                  dispatch(setDarkMode(!isDarkMode));
                  document.body.classList.add('dark-transition');
                  setTimeout(() => {
                    document.body.classList.remove('dark-transition');
                  }, 1000);
                }}
              >
                {isDarkMode ? <FontAwesomeIcon icon="sun" /> : <FontAwesomeIcon icon="moon" />}
              </Button>
            </OverlayTrigger>
            <NavDropdown id="language-dropdown" title={loadFlag()} align="end">
              {LOCALES.map(locale => (
                <NavDropdown.Item
                  id={locale.name + '-button'}
                  key={locale.name}
                  className="text-center"
                  onClick={() => {
                    changeLaguagePrefferences(locale);
                    setExpanded(false);
                  }}
                >
                  <span className={locale.flag + ' me-2'} />
                  {locale.name.toUpperCase()}
                </NavDropdown.Item>
              ))}
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
      <SwitchInstanceModal
        show={showSwitchModal}
        onClose={() => setShowSwitchModal(false)}
      />
    </Navbar>
  );
};

export default NavbarComponent;
