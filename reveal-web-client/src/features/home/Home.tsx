import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import { useAppDispatch } from "../../store/hooks";
import { logout } from "../reducers/user";
import { useNavigate } from "react-router";

function Home() {

  const dispatch = useAppDispatch();
  const navigator = useNavigate();

  return (
    <Container className="text-center my-5">
      <h1>Welcome to Reveal</h1>
      <h2>You have successfully logged in! You can now visit protected pages or logout</h2>
      <p>Get started by selecting an intervention below</p>
      <Button onClick={() => {
        dispatch(logout(null));
        navigator("/login");
      }}>Logout</Button>
    </Container>
  );
}

export default Home;
