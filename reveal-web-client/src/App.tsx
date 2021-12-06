import "./App.css";
import NavbarComponent from "./components/Layout/Navbar/Navbar";
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';

function App() {
  return (
    <>
      <NavbarComponent />
      <Container className="text-center">
        <h1>Welcome to Reveal</h1>
        <p>Get started by selecting an intervention below</p>
        <Button>Bootstrap button</Button>
      </Container>
    </>
  );
}

export default App;
