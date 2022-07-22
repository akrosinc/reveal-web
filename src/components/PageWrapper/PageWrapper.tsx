import React from 'react';
import { Container } from 'react-bootstrap';

interface Props {
  title?: string;
  children: JSX.Element;
}

const PageWrapper = ({ title, children }: Props) => {
  return (
    <Container fluid className="my-4 px-2">
      {title ? (
        <>
          <h2>{title}</h2>
          <hr className="my-4" />
        </>
      ) : null}
      {children}
    </Container>
  );
};

export default PageWrapper;
