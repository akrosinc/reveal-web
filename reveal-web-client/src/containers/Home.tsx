import React from "react";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";

function Home() {
  return (
    <Container className="text-center">
      <h1>Welcome to Reveal</h1>
      <p>Get started by selecting an intervention below</p>
      <Button>Bootstrap button</Button>
    </Container>
  );
}

export default Home;
