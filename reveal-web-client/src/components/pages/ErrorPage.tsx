import React from "react";
import { Link } from "react-router-dom";
import { Container } from 'react-bootstrap';

const ErrorPage = () => {
  return (
    <Container className="text-center mt-5">
      <h2>Not found 404</h2>
      <p>There's nothing here!</p>
      <Link to="/">Go to homepage</Link>
    </Container>
  );
};

export default ErrorPage;
