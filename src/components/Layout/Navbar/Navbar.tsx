import { Container, Nav, Navbar, NavDropdown } from "react-bootstrap";
import logo from "../../../assets/logos/reveal-logo.png";
import { BsPerson } from "react-icons/bs";
import { useAppSelector } from "../../../store/hooks";
import { Link } from "react-router-dom";
import { useKeycloak } from "@react-keycloak/web";
import { MAIN_MENU } from "./menuConstants";

export default function NavbarComponent() {
  const { keycloak } = useKeycloak();

  let user = useAppSelector((state) => state.user.value);

  return (
    <Navbar collapseOnSelect expand="lg">
      <Container fluid className="px-4 pt-1">
        <Navbar.Brand style={{ marginTop: "-10px" }}>
          <img src={logo} alt="" />
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav" className={keycloak.authenticated ? "" : "justify-content-end"}>
          {keycloak.authenticated ? (
            <Nav className="me-auto">
              {MAIN_MENU.map((el, index) => {
                if (el.dropdown !== undefined && el.dropdown.length > 0) {
                  return (
                    <NavDropdown
                      title={el.pageTitle}
                      key={index}
                      id="collasible-nav-dropdown"
                    >
                      {el.dropdown.map((child, childIndex) => {
                        return (
                          <NavDropdown.Item
                            as={Link}
                            role="button"
                            key={index + "." + childIndex}
                            to={child.route}
                            className="py-2"
                          >
                            {child.pageTitle}
                          </NavDropdown.Item>
                        );
                      })}
                    </NavDropdown>
                  );
                } else {
                  return (
                    <Link key={index} to={el.route} className="nav-link">
                      {el.pageTitle}
                    </Link>
                  );
                }
              })}
            </Nav>
          ) : null}
          {(keycloak.authenticated) ? (
            <Nav style={{ alignItems: "center" }}>
              <BsPerson />
              <NavDropdown
                title={user !== null ? user.preferred_username : "User Profile"}
                id="collasible-nav-dropdown"
                align="end"
              >
                <NavDropdown.Item
                  onClick={() => {
                    keycloak.logout();
                  }}
                >
                  Sign out
                </NavDropdown.Item>
              </NavDropdown>
            </Nav>
          ) : (
            <Nav>
              <Nav.Link className="btn btn-success text-white" style={{width: '100px'}} onClick={() => keycloak.login()}>Login</Nav.Link>
            </Nav>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
