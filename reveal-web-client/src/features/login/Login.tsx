import React from "react";
import { Container, Button } from "react-bootstrap";
import { useNavigate } from "react-router";
import { login } from "../reducers/user";
import { useAppDispatch } from "../../store/hooks";

function Login() {
  const dispatch = useAppDispatch();
  const navigator = useNavigate();

  return (
    <Container className="text-center">
      <h1>Welcome to Reveal</h1>
      <p>Get started by selecting an intervention below</p>
      <Button
        onClick={() => {
          dispatch(login({ username: "test", name: "test", lastname: "test" }));
          navigator("/");
        }}
      >
        Login
      </Button>
    </Container>
  );
}

export default Login;
