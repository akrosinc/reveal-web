import { Button, Container, Nav, Navbar, NavDropdown, OverlayTrigger, Tooltip } from 'react-bootstrap';
import logo from '../../../assets/logos/reveal-logo.png';
import logoWhite from '../../../assets/logos/reveal-logo-white.png';
import { BsPerson } from 'react-icons/bs';
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

export default function NavbarComponent() {
  const { t } = useTranslation();
  const { keycloak, initialized } = useKeycloak();
  const [user, setUser] = useState<KeycloakProfile>();
  const isDarkMode = useAppSelector(state => state.darkMode.value);
  const dispatch = useAppDispatch();
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (initialized && keycloak.authenticated) {
      keycloak.loadUserProfile().then(userProfile => {
        setUser(userProfile);
      });
    }
  }, [keycloak, initialized]);

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
                  return (
                    <AuthorizedElement key={index} roles={el.roles}>
                      <NavDropdown
                        align="start"
                        title={t('topNav.' + el.pageTitle)}
                        id={el.pageTitle + '-navbar-button'}
                        className="m-1"
                      >
                        {el.dropdown.map((child, childIndex) => {
                          return (
                            <AuthorizedElement key={index + '.' + childIndex} roles={child.roles}>
                              <NavDropdown.Item
                                as={Link}
                                role="button"
                                to={child.route}
                                className="text-center"
                                onClick={() => setExpanded(false)}
                              >
                                {t('topNav.' + child.pageTitle)}
                              </NavDropdown.Item>
                            </AuthorizedElement>
                          );
                        })}
                      </NavDropdown>
                    </AuthorizedElement>
                  );
                } else {
                  return (
                    <AuthorizedElement key={index} roles={el.roles}>
                      <Link
                        onClick={() => setExpanded(false)}
                        id={el.pageTitle + '-navbar-button'}
                        to={el.route}
                        className="nav-link m-1"
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
            <Nav className="d-inline">
              <BsPerson size="1.2rem" className="mt-2 me-2 float-start" />
              <NavDropdown title={user.username} id="logout-nav-dropdown" align="end" className="me-md-4">
                <NavDropdown.Item
                  id="logout-button"
                  className="text-center"
                  onClick={() => {
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
          <Nav className="ms-1">
            <OverlayTrigger
              placement="auto"
              overlay={<Tooltip>{isDarkMode ? 'Turn off dark mode' : 'Turn on dark mode'}</Tooltip>}
            >
              <Button
                className="rounded-circle me-auto mx-md-2"
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
                  <span className={locale.flag + ' me-2'}></span>
                  {locale.name.toUpperCase()}
                </NavDropdown.Item>
              ))}
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
