import { Container, Nav, Navbar, NavDropdown } from 'react-bootstrap';
import logo from '../../../assets/logos/reveal-logo.png';
import { BsPerson } from 'react-icons/bs';
import { Link } from 'react-router-dom';
import { useKeycloak } from '@react-keycloak/web';
import { MAIN_MENU } from './menuItems';
import AuthorizedElement from '../../AuthorizedElement';
import i18n, { LOCALES } from '../../../i18n';
import { useTranslation } from 'react-i18next';
import { setToBrowser } from '../../../utils';
import './index.css';
import 'flag-icons/css/flag-icons.css';
import { KeycloakProfile } from 'keycloak-js';
import { useEffect, useState } from 'react';

export default function NavbarComponent() {
  const { t } = useTranslation();
  const { keycloak, initialized } = useKeycloak();
  const [user, setUser] = useState<KeycloakProfile>();

  useEffect(() => {
    if (initialized && keycloak.authenticated) {
      keycloak.loadUserProfile().then(userProfile => {
        setUser(userProfile);
      });
    }
  }, [keycloak, initialized]);

  const changeLaguagePrefferences = (lang: any) => {
    i18n.changeLanguage(lang.name);
    setToBrowser('locale', lang.name);
  };

  const loadFlag = () => {
    let currentLanguage = LOCALES.filter(el => el.name === i18n.language);
    return <span className={currentLanguage[0].flag}></span>;
  };

  return (
    <Navbar collapseOnSelect expand="lg">
      <Container fluid className="px-4 pt-1">
        <Navbar.Brand style={{ marginTop: '-10px' }}>
          <img src={logo} alt="" />
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav" className={keycloak.authenticated ? '' : 'justify-content-end'}>
          {keycloak.authenticated ? (
            <Nav className="me-auto">
              {MAIN_MENU.map((el, index) => {
                if (el.dropdown !== undefined && el.dropdown.length > 0) {
                  return (
                    <AuthorizedElement key={index} roles={el.roles}>
                      <NavDropdown
                        align={'end'}
                        title={t('topNav.' + el.pageTitle)}
                        id={el.pageTitle + '-navbar-button'}
                      >
                        {el.dropdown.map((child, childIndex) => {
                          return (
                            <AuthorizedElement key={index + '.' + childIndex} roles={child.roles}>
                              <NavDropdown.Item as={Link} role="button" to={child.route} className="text-center">
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
                      <Link id={el.pageTitle + '-navbar-button'} to={el.route} className="nav-link">
                        {t('topNav.' + el.pageTitle)}
                      </Link>
                    </AuthorizedElement>
                  );
                }
              })}
            </Nav>
          ) : null}
          {initialized && user ? (
            <Nav>
              <div className="d-flex align-items-center">
                <BsPerson />
                <NavDropdown
                  title={user.username}
                  id="logout-nav-dropdown"
                  align="end"
                >
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
              </div>
            </Nav>
          ) : (
            <Nav>
              <Nav.Link
                id="login-button"
                className="btn btn-success text-white mw-100"
                onClick={() => keycloak.login()}
              >
                {t('topNav.logIn')}
              </Nav.Link>
            </Nav>
          )}
          <Nav className="ms-1">
            <NavDropdown id="language-dropdown" title={loadFlag()} align="end">
              {LOCALES.map(locale => (
                <NavDropdown.Item
                  id={locale.name + '-button'}
                  key={locale.name}
                  className="text-center"
                  onClick={() => changeLaguagePrefferences(locale)}
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
