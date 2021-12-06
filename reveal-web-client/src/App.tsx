import { Route, Routes } from "react-router";
import "./App.css";
import NavbarComponent from "./components/Layout/Navbar/Navbar";
import Footer from "./components/Layout/Footer/Footer";
import Home from "./containers/Home";
import Register from "./containers/Register";

function App() {
  return (
    <>
      <NavbarComponent />
      <Routes>
        <Route path="/" element={<Home />}></Route>
        <Route path="/registerUser" element={<Register/>}></Route>
      </Routes>
      <Footer />
    </>
  );
}

export default App;
