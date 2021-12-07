import { Container, Nav, Navbar, NavDropdown, NavLink } from "react-bootstrap";
import logo from "../../../assets/logos/reveal-logo.png";
import { BsPerson } from "react-icons/bs";
import { KEYCLOAK_LOGIN_URL } from "../../../constants/urls";
import { useAppSelector } from "../../../store/hooks";

export default function NavbarComponent() {
  let user = useAppSelector((state) => state.user.value);
  return (
    <Navbar collapseOnSelect expand="lg" bg="light" variant="light">
      <Container fluid className="px-4 pt-1">
        <Navbar.Brand style={{ marginTop: "-10px" }} href="#home">
          <img src={logo} alt="" />
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          {user ? (
            <Nav className="me-auto">
              <Nav.Link as={NavLink} to='/'>Home</Nav.Link>
              <NavDropdown title="Plan" id="collasible-nav-dropdown">
                <NavDropdown.Item href="#action/3.1">Action</NavDropdown.Item>
                <NavDropdown.Item href="#action/3.2">
                  Another action
                </NavDropdown.Item>
                <NavDropdown.Item href="#action/3.3">
                  Something
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item href="#action/3.4">
                  Separated link
                </NavDropdown.Item>
              </NavDropdown>
              <Nav.Link href="#pricing">Assign</Nav.Link>
              <Nav.Link href="#pricing">Monitor</Nav.Link>
              <NavDropdown title="Admin" id="collasible-nav-dropdown">
                <NavDropdown.Item href="#action/3.1">Action</NavDropdown.Item>
                <NavDropdown.Item href="#action/3.2">
                  Another action
                </NavDropdown.Item>
                <NavDropdown.Item href="#action/3.3">
                  Something
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item as={NavLink} to='/register'>
                  User management
                </NavDropdown.Item>
              </NavDropdown>
            </Nav>
          ) : (
            <Nav className="me-auto">
              <Nav.Link href="/">Home</Nav.Link>
            </Nav>
          )}
          {user ? (
            <Nav style={{ alignItems: "center" }}>
              <BsPerson />
              <NavDropdown title="User profile" id="collasible-nav-dropdown">
                <NavDropdown.Item href="#action/3.1">Logout</NavDropdown.Item>
              </NavDropdown>
            </Nav>
          ) : (
            <Nav style={{ alignItems: "center" }}>
              <Nav.Link href={KEYCLOAK_LOGIN_URL}>Login</Nav.Link>
            </Nav>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
