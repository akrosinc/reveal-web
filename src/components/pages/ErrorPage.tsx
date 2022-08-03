import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Container } from 'react-bootstrap';

const ErrorPage = () => {
  const navigate = useNavigate();

  return (
    <Container className="text-center mt-5">
      <h2>Not found 404</h2>
      <p>There's nothing here!</p>
      <p className='link-primary' onClick={() => navigate('/')}>Go to homepage</p>
      <p className='link-primary mt-2' onClick={() => navigate(-1)}>Go to previouse page</p>
    </Container>
  );
};

export default ErrorPage;
