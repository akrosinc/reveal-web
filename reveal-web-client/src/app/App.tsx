import "./App.css";
import NavbarComponent from "../components/Layout/Navbar/Navbar";
import Footer from "../components/Layout/Footer/Footer";
import Router from "../components/Router";

function App() {
  return (
    <>
      <NavbarComponent />
      <Router/>
      <Footer />
    </>
  );
}

export default App;
