import { Container, Nav, Navbar, NavDropdown } from "react-bootstrap";
import logo from "../../../assets/logos/reveal-logo.png";
import { BsPerson } from "react-icons/bs";
import { useAppSelector } from "../../../store/hooks";
import { Link } from "react-router-dom";
import { useKeycloak } from "@react-keycloak/web";

export default function NavbarComponent() {
  const { keycloak } = useKeycloak();

  let user = useAppSelector((state) => state.user.value);

  return (
    <Navbar collapseOnSelect expand="lg">
      <Container fluid className="px-4 pt-1">
        <Navbar.Brand style={{ marginTop: "-10px" }} href="#home">
          <img src={logo} alt="" />
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          {keycloak.authenticated ? (
            <Nav className="me-auto">
              <Link to="/" className="nav-link">
                Home
              </Link>
              <NavDropdown title="Plan" id="collasible-nav-dropdown">
                <NavDropdown.Item>
                  <Link to="/" className="nav-link">
                    Manage Plans
                  </Link>
                </NavDropdown.Item>
                <NavDropdown.Item>
                  <Link to="/" className="nav-link">
                    Planning tools
                  </Link>
                </NavDropdown.Item>
              </NavDropdown>
              <Link to="/" className="nav-link">
                Assign
              </Link>
              <NavDropdown title="Monitor" id="collasible-nav-dropdown">
                <NavDropdown.Item>
                  <Link to="/" className="nav-link">
                    IRS Reporting
                  </Link>
                </NavDropdown.Item>
                <NavDropdown.Item>
                  <Link to="/" className="nav-link">
                    SMC Reporting
                  </Link>
                </NavDropdown.Item>
              </NavDropdown>
              <NavDropdown title="Admin" id="collasible-nav-dropdown">
                <NavDropdown.Item>
                  <Link to="/" className="nav-link">
                    Teams
                  </Link>
                </NavDropdown.Item>
                <NavDropdown.Item>
                  <Link to="/register" className="nav-link">
                    User Management
                  </Link>
                </NavDropdown.Item>
              </NavDropdown>
            </Nav>
          ) : (
            null
          )}
          {keycloak.authenticated ? (
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
            ""
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
