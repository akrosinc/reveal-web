import { Container, Nav, Navbar, NavDropdown } from "react-bootstrap";
import logo from "../../../assets/logos/reveal-logo.png";
import { BsPerson } from "react-icons/bs";
import { useAppSelector } from "../../../store/hooks";
import { Link } from "react-router-dom";
import { useKeycloak } from "@react-keycloak/web";
import { MAIN_MENU } from "./menuItems";
import AuthorizedElement from "../../AuthorizedElement";
import i18n, { LOCALES } from "../../../i18n";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { setToBrowser } from "../../../utils";
import "./index.css";

export default function NavbarComponent() {
  const { t } = useTranslation();
  const { keycloak } = useKeycloak();
  const [language, setLanguage] = useState(i18n.language);

  let user = useAppSelector((state) => state.user.value);
  const changeLaguagePrefferences = (lang: string) => {
    setLanguage(lang);
    i18n.changeLanguage(lang);
    setToBrowser("locale", lang);
  };

  return (
    <Navbar collapseOnSelect expand="lg">
      <Container fluid className="px-4 pt-1">
        <Navbar.Brand style={{ marginTop: "-10px" }}>
          <img src={logo} alt="" />
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse
          id="responsive-navbar-nav"
          className={keycloak.authenticated ? "" : "justify-content-end"}
        >
          {keycloak.authenticated ? (
            <Nav className="me-auto">
              {MAIN_MENU.map((el, index) => {
                if (el.dropdown !== undefined && el.dropdown.length > 0) {
                  return (
                    <AuthorizedElement key={index} roles={el.roles}>
                      <NavDropdown
                        title={t("topNav." + el.pageTitle)}
                        id="collasible-nav-dropdown"
                      >
                        {el.dropdown.map((child, childIndex) => {
                          return (
                            <AuthorizedElement
                              key={index + "." + childIndex}
                              roles={child.roles}
                            >
                              <NavDropdown.Item
                                as={Link}
                                role="button"
                                to={child.route}
                              >
                                {t("topNav." + child.pageTitle)}
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
                      <Link to={el.route} className="nav-link">
                        {t("topNav." + el.pageTitle)}
                      </Link>
                    </AuthorizedElement>
                  );
                }
              })}
            </Nav>
          ) : null}
          {keycloak.authenticated ? (
            <Nav>
              <div className="d-flex align-items-center">
                <BsPerson />
                <NavDropdown
                  title={
                    user !== null ? user.preferred_username : "User Profile"
                  }
                  id="collasible-nav-dropdown"
                  align="end"
                >
                  <NavDropdown.Item
                    className="text-center"
                    onClick={() => {
                      keycloak.logout();
                    }}
                  >
                    {t("topNav.logOut")}
                  </NavDropdown.Item>
                </NavDropdown>
              </div>
            </Nav>
          ) : (
            <Nav>
              <Nav.Link
                className="btn btn-success text-white mw-100"
                onClick={() => keycloak.login()}
              >
                {t("topNav.logIn")}
              </Nav.Link>
            </Nav>
          )}
          <Nav>
            <NavDropdown title={language.toUpperCase()} align="end">
              <NavDropdown.Item
                className="text-center"
                onClick={() => {
                  changeLaguagePrefferences(LOCALES[0]);
                }}
              >
                <span className={"fi me-2 fi-gb"}></span>
                {LOCALES[0].toUpperCase()}
              </NavDropdown.Item>
              <NavDropdown.Item
                className="text-center"
                onClick={() => changeLaguagePrefferences(LOCALES[1])}
              >
                <span className={"fi me-2 fi-de"}></span>
                {LOCALES[1].toUpperCase()}
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
