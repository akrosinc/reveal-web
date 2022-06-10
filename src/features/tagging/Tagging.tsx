import React from 'react';
import { Button } from 'react-bootstrap';
import DefaultTable from '../../components/Table/DefaultTable';

const Tagging = () => {
  return (
    <>
      <div className="text-end">
        <Button>Create Tag</Button>
      </div>
      <DefaultTable columns={[]} data={[]} />
    </>
  );
};

export default Tagging;
