import React from 'react';
import { Spinner } from 'react-bootstrap';
import { CSSProperties } from 'react-transition-group/node_modules/@types/react';
import { useAppSelector } from '../../store/hooks';

const loaderBackdrop: CSSProperties = {
  backgroundColor: 'rgba(0, 0, 0, 0.25)',
  position: 'absolute',
  left: '0',
  top: '0',
  width: '100vw',
  height: '100vh',
  zIndex: 9999,
};

const Loader = () => {
  const isLoading = useAppSelector(state => state.loader.value);

  if (isLoading) {
    return (
      <div style={loaderBackdrop}>
        <Spinner
          animation="grow"
          variant="success"
          style={{
            width: '3rem',
            height: '3rem',
            position: 'absolute',
            left: '50%',
            top: '40%',
            marginLeft: '-1.5rem'
          }}
        />
      </div>
    );
  } else {
    return null;
  }
};

export default Loader;
